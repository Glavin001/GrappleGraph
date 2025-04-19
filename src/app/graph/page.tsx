'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { bjjKnowledgeBase } from '../../data/bjj_knowledge_base';
import { BjjTechniqueType, BjjDifficulty, BjjApplicability } from '../../types/bjj';
import type { Position, Technique } from '../../types/bjj';
import type { ConcretePositionId, ConcreteTechniqueId } from '../../data/bjj_knowledge_base';
import { ReactFlowProvider } from 'reactflow';

// Load ReactFlow dynamically to avoid SSR issues
const ReactFlowWrapper = dynamic(
  () => import('../../components/Graph/ReactFlowWrapper'),
  { ssr: false }
);

export default function GraphPage() {
  const [selectedPosition, setSelectedPosition] = useState<Position<ConcretePositionId, ConcreteTechniqueId> | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique<ConcretePositionId, ConcreteTechniqueId> | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<ConcretePositionId | null>(null);
  const [filters, setFilters] = useState({
    techniqueType: 'all' as 'all' | BjjTechniqueType,
    difficulty: 'all' as 'all' | BjjDifficulty,
    applicability: 'all' as 'all' | BjjApplicability,
    showVariants: true,
    selectedPositionId: null as ConcretePositionId | null,
  });

  // Calculate statistics for knowledge base
  const stats = {
    positionCount: Object.keys(bjjKnowledgeBase.positions).length,
    techniqueCount: Object.keys(bjjKnowledgeBase.techniques).length,
    submissionCount: Object.values(bjjKnowledgeBase.techniques).filter(
      t => t.type === BjjTechniqueType.Submission
    ).length,
  };

  const handleNodeClick = (positionId: ConcretePositionId) => {
    setSelectedPosition(bjjKnowledgeBase.positions[positionId]);
    setSelectedTechnique(null);
    setFilters({
      ...filters,
      selectedPositionId: positionId,
    });
    // Don't set focus on direct node click to avoid re-centering
    setFocusNodeId(null);
  };

  const handleEdgeClick = (techniqueId: ConcreteTechniqueId) => {
    setSelectedTechnique(bjjKnowledgeBase.techniques[techniqueId]);
    setSelectedPosition(null);
    setFilters({
      ...filters,
      selectedPositionId: null,
    });
  };

  const handlePositionLink = (positionId: ConcretePositionId) => {
    // Navigate to the position and focus on it
    setSelectedPosition(bjjKnowledgeBase.positions[positionId]);
    setSelectedTechnique(null);
    setFilters({
      ...filters,
      selectedPositionId: positionId,
    });
    // Set focus to center the node in the visualization
    setFocusNodeId(positionId);
  };

  const handleFilterChange = (name: string, value: string | boolean) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearSelection = () => {
    setSelectedPosition(null);
    setSelectedTechnique(null);
    setFilters({
      ...filters,
      selectedPositionId: null,
    });
    setFocusNodeId(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-indigo-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">GrappleGraph</h1>
          <p className="text-sm opacity-80">
            Positions: {stats.positionCount} | Techniques: {stats.techniqueCount} | Submissions: {stats.submissionCount}
          </p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - filters */}
        <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
          <h2 className="font-bold text-lg mb-4">Filters</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="techniqueType">Technique Type</label>
            <select 
              id="techniqueType"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={filters.techniqueType}
              onChange={(e) => handleFilterChange('techniqueType', e.target.value)}
            >
              <option value="all">All Types</option>
              {Object.values(BjjTechniqueType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="difficulty">Difficulty</label>
            <select 
              id="difficulty"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="all">All Difficulties</option>
              {Object.values(BjjDifficulty).map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="applicability">Applicability</label>
            <select 
              id="applicability"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={filters.applicability}
              onChange={(e) => handleFilterChange('applicability', e.target.value)}
            >
              <option value="all">All (Gi & No-Gi)</option>
              {Object.values(BjjApplicability).map(applicability => (
                <option key={applicability} value={applicability}>{applicability}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center text-sm font-medium" htmlFor="showVariants">
              <input 
                id="showVariants"
                type="checkbox" 
                className="mr-2"
                checked={filters.showVariants}
                onChange={(e) => handleFilterChange('showVariants', e.target.checked)}
              />
              Show Position Variants
            </label>
          </div>
          
          <button 
            type="button"
            className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
            onClick={clearSelection}
          >
            Clear Selection
          </button>
        </div>

        {/* Main content - graph visualization */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <ReactFlowWrapper 
              knowledgeBase={bjjKnowledgeBase} 
              filters={filters}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              focusNode={focusNodeId}
            />
          </ReactFlowProvider>
        </div>

        {/* Right sidebar - details panel */}
        <div className="w-80 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
          {selectedPosition && (
            <div className="mb-6">
              <h2 className="font-bold text-xl mb-2">{selectedPosition.name}</h2>
              {selectedPosition.aliases && selectedPosition.aliases.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Also known as: {selectedPosition.aliases.join(', ')}
                </p>
              )}
              <div className="mb-3">
                <span className="inline-block bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded">
                  {selectedPosition.advantage || 'Neutral'}
                </span>
                {selectedPosition.isVariant && (
                  <span className="inline-block bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 text-xs px-2 py-1 rounded ml-2">
                    Variant
                  </span>
                )}
              </div>
              <p className="text-sm mb-4">{selectedPosition.description}</p>
              
              {selectedPosition.applicableTechniqueIds && selectedPosition.applicableTechniqueIds.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-1">Available Techniques:</h3>
                  <ul className="text-sm">
                    {selectedPosition.applicableTechniqueIds.map(techId => (
                      <li key={techId} className="mb-1">
                        <button
                          type="button"
                          className="text-left w-full hover:text-indigo-600 focus:text-indigo-600 focus:outline-none"
                          onClick={() => handleEdgeClick(techId)}
                        >
                          {bjjKnowledgeBase.techniques[techId].name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedPosition.inversePositionId && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-sm mb-1">Inverse Position:</h3>
                  <button
                    type="button"
                    className="text-left text-sm text-indigo-600 hover:text-indigo-800 focus:text-indigo-800 focus:outline-none"
                    onClick={() => handlePositionLink(selectedPosition.inversePositionId as ConcretePositionId)}
                  >
                    {bjjKnowledgeBase.positions[selectedPosition.inversePositionId].name}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    View this position from the other perspective
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedTechnique && (
            <div>
              <h2 className="font-bold text-xl mb-2">{selectedTechnique.name}</h2>
              {selectedTechnique.aliases && selectedTechnique.aliases.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Also known as: {selectedTechnique.aliases.join(', ')}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs px-2 py-1 rounded">
                  {selectedTechnique.type}
                </span>
                <span className="inline-block bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs px-2 py-1 rounded">
                  {selectedTechnique.difficulty}
                </span>
                <span className="inline-block bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 text-xs px-2 py-1 rounded">
                  {selectedTechnique.applicability}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm">Starting Position:</h3>
                  <button
                    type="button"
                    className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none underline"
                    onClick={() => handlePositionLink(selectedTechnique.originPositionId)}
                  >
                    {bjjKnowledgeBase.positions[selectedTechnique.originPositionId].name}
                  </button>
                </div>
              </div>
              
              <p className="text-sm mb-4">{selectedTechnique.description}</p>
              
              {selectedTechnique.steps && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-1">Steps:</h3>
                  <ol className="list-decimal list-inside text-sm">
                    {selectedTechnique.steps.map((step) => (
                      <li key={`step-${step.substring(0, 15)}`} className="mb-1">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              {selectedTechnique.outcomes && selectedTechnique.outcomes.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-1">Possible Outcomes:</h3>
                  <ul className="text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedTechnique.outcomes.map((outcome) => (
                      <li key={`outcome-${outcome.type}-${outcome.endPositionId || ''}`} className="py-3">
                        <div className="font-medium">{outcome.type}</div>
                        <div className="mb-1">{outcome.description}</div>
                        
                        {outcome.endPositionId && (
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 mr-2">Position:</span>
                            <button
                              type="button"
                              className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none underline"
                              onClick={() => handlePositionLink(outcome.endPositionId as ConcretePositionId)}
                            >
                              {bjjKnowledgeBase.positions[outcome.endPositionId].name}
                            </button>
                          </div>
                        )}
                        
                        {outcome.likelihood && (
                          <div className="text-xs text-gray-500 mt-1">Likelihood: {outcome.likelihood}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedTechnique.notes && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-1">Notes:</h3>
                  <p className="text-sm">{selectedTechnique.notes}</p>
                </div>
              )}
            </div>
          )}

          {!selectedPosition && !selectedTechnique && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Select a position or technique to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 