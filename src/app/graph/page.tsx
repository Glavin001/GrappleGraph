'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { bjjKnowledgeBase } from '../../data/bjj_knowledge_base';
import { BjjTechniqueType, BjjDifficulty, BjjApplicability } from '../../types/bjj';
import type { Position, Technique } from '../../types/bjj';
import type { ConcretePositionId, ConcreteTechniqueId } from '../../data/bjj_knowledge_base';
import { ReactFlowProvider } from 'reactflow';
import { 
  Autocomplete, 
  Select, 
  Checkbox, 
  Button, 
  AppShell, 
  Burger, 
  Group, 
  Stack, 
  Title, 
  Text, 
  Box, 
  ScrollArea, 
  Paper, 
  Divider, 
  Badge 
} from '@mantine/core'; // Import Mantine components
import type { ComboboxItem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

// Load ReactFlow dynamically to avoid SSR issues
const ReactFlowWrapper = dynamic(
  () => import('../../components/Graph/ReactFlowWrapper'),
  { ssr: false }
);

// Prepare select data
const techniqueTypeOptions = [
  { value: 'all', label: 'All Types' },
  ...Object.values(BjjTechniqueType).map(type => ({ value: type, label: type }))
];
const difficultyOptions = [
  { value: 'all', label: 'All Difficulties' },
  ...Object.values(BjjDifficulty).map(difficulty => ({ value: difficulty, label: difficulty }))
];
const applicabilityOptions = [
  { value: 'all', label: 'All (Gi & No-Gi)' },
  ...Object.values(BjjApplicability).map(applicability => ({ value: applicability, label: applicability }))
];

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
  const [searchValue, setSearchValue] = useState(''); // State for search input
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure();
  const [mobileAsideOpened, { toggle: toggleMobileAside }] = useDisclosure();

  // Prepare position data for Autocomplete in { value: id, label: name } format
  const positionSearchData = useMemo((): ComboboxItem[] => {
    return Object.values(bjjKnowledgeBase.positions).map(pos => ({
      value: pos.id, // Use position ID as the value
      label: pos.name, // Use position name as the label
    }));
  }, []);

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
    setFilters(currentFilters => ({ // Use functional update
      ...currentFilters,
      selectedPositionId: positionId,
    }));
    setFocusNodeId(null);
    if (mobileAsideOpened) toggleMobileAside(); // Close aside on mobile if open
  };

  const handleEdgeClick = (techniqueId: ConcreteTechniqueId) => {
    setSelectedTechnique(bjjKnowledgeBase.techniques[techniqueId]);
    setSelectedPosition(null);
    setFilters(currentFilters => ({ // Use functional update
      ...currentFilters,
      selectedPositionId: null,
    }));
    if (mobileAsideOpened) toggleMobileAside(); // Close aside on mobile if open
  };

  const handlePositionLink = (positionId: ConcretePositionId) => {
    setSelectedPosition(bjjKnowledgeBase.positions[positionId]);
    setSelectedTechnique(null);
    setFilters(currentFilters => ({ // Use functional update
      ...currentFilters,
      selectedPositionId: positionId,
    }));
    setFocusNodeId(positionId);
    if (mobileAsideOpened) toggleMobileAside(); // Close aside on mobile if open
  };

  const handleFilterChange = (name: string, value: string | boolean) => {
    setFilters(currentFilters => ({ // Use functional update
      ...currentFilters,
      [name]: value,
    }));
  };

  const clearSelection = () => {
    setSelectedPosition(null);
    setSelectedTechnique(null);
    setFilters(currentFilters => ({ // Use functional update
      ...currentFilters,
      selectedPositionId: null,
    }));
    setFocusNodeId(null);
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !mobileNavOpened } }}
      aside={{ width: 400, breakpoint: 'sm', collapsed: { mobile: !mobileAsideOpened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
             <Burger opened={mobileNavOpened} onClick={toggleMobileNav} hiddenFrom="sm" size="sm" />
             <Title order={2}>GrappleGraph</Title>
          </Group>
          <Text size="sm" c="dimmed">
            Positions: {stats.positionCount} | Techniques: {stats.techniqueCount} | Submissions: {stats.submissionCount}
          </Text>
          <Burger opened={mobileAsideOpened} onClick={toggleMobileAside} hiddenFrom="sm" size="sm" />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea h="calc(100vh - var(--app-shell-header-height) - var(--app-shell-padding)*2)">
            <Stack>
                {/* Position Search Input */}
                <Autocomplete
                  label="Search Position"
                  placeholder="Enter position name..."
                  data={positionSearchData} 
                  value={searchValue}
                  onChange={setSearchValue}
                  onOptionSubmit={(value: string) => { 
                    handlePositionLink(value as ConcretePositionId);
                    setSearchValue(''); 
                    if (mobileNavOpened) toggleMobileNav(); // Close nav on mobile after selection
                  }}
                  limit={10} 
                  nothingFound="No position found"
                />
                
                <Divider />

                <Title order={4}>Filters</Title>
                
                <Select
                  label="Technique Type"
                  data={techniqueTypeOptions}
                  value={filters.techniqueType}
                  onChange={(value) => handleFilterChange('techniqueType', value || 'all')}
                />
                
                <Select
                  label="Difficulty"
                  data={difficultyOptions}
                  value={filters.difficulty}
                  onChange={(value) => handleFilterChange('difficulty', value || 'all')}
                />
                
                <Select
                  label="Applicability"
                  data={applicabilityOptions}
                  value={filters.applicability}
                  onChange={(value) => handleFilterChange('applicability', value || 'all')}
                />
                
                <Checkbox
                  label="Show Position Variants"
                  checked={filters.showVariants}
                  onChange={(event) => handleFilterChange('showVariants', event.currentTarget.checked)}
                />
                
                <Button 
                  fullWidth
                  onClick={clearSelection}
                  variant="light"
                >
                  Clear Selection
                </Button>
            </Stack>
         </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main style={{ height: '100vh' }}>
        <ReactFlowProvider>
            <ReactFlowWrapper 
              knowledgeBase={bjjKnowledgeBase} 
              filters={filters}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              focusNode={focusNodeId}
            />
        </ReactFlowProvider>
      </AppShell.Main>
      
      <AppShell.Aside p="md">
         <ScrollArea h="calc(100vh - var(--app-shell-header-height) - var(--app-shell-padding)*2)">
          {selectedPosition && (
            <Paper shadow="xs" p="md" withBorder>
              <Stack>
                <Title order={3}>{selectedPosition.name}</Title>
                {selectedPosition.aliases && selectedPosition.aliases.length > 0 && (
                  <Text size="sm" c="dimmed">
                    Also known as: {selectedPosition.aliases.join(', ')}
                  </Text>
                )}
                <Group>
                  <Badge color="blue">{selectedPosition.advantage || 'Neutral'}</Badge>
                  {selectedPosition.isVariant && (
                     <Badge color="purple">Variant</Badge>
                  )}
                </Group>
                <Text size="sm">{selectedPosition.description}</Text>
                
                {selectedPosition.applicableTechniqueIds && selectedPosition.applicableTechniqueIds.length > 0 && (
                  <Box>
                    <Title order={5} mb="xs">Available Techniques:</Title>
                    <Stack gap="xs">
                      {selectedPosition.applicableTechniqueIds.map(techId => (
                        <Button
                          key={techId}
                          variant="subtle"
                          size="sm"
                          justify="left"
                          fullWidth
                          onClick={() => handleEdgeClick(techId)}
                          style={{ whiteSpace: 'normal', height: 'auto' }}
                        >
                          {bjjKnowledgeBase.techniques[techId].name}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}
                
                {selectedPosition.inversePositionId && (
                  <Box mt="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-divider)'}}>
                    <Title order={5} mb="xs">Inverse Position:</Title>
                     <Button
                       variant="subtle"
                       size="sm"
                       onClick={() => handlePositionLink(selectedPosition.inversePositionId as ConcretePositionId)}
                       style={{ whiteSpace: 'normal', height: 'auto' }}
                     >
                      {bjjKnowledgeBase.positions[selectedPosition.inversePositionId].name}
                    </Button>
                    <Text size="xs" c="dimmed" mt={4}>
                      View this position from the other perspective
                    </Text>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}

          {selectedTechnique && (
             <Paper shadow="xs" p="md" withBorder>
              <Stack>
                <Title order={3}>{selectedTechnique.name}</Title>
                 {selectedTechnique.aliases && selectedTechnique.aliases.length > 0 && (
                  <Text size="sm" c="dimmed">
                    Also known as: {selectedTechnique.aliases.join(', ')}
                  </Text>
                )}
                 <Group gap="xs">
                  <Badge color="green">{selectedTechnique.type}</Badge>
                  <Badge color="yellow">{selectedTechnique.difficulty}</Badge>
                  <Badge color="red">{selectedTechnique.applicability}</Badge>
                </Group>
                
                <Box>
                   <Group justify="space-between" align="center">
                      <Title order={5}>Starting Position:</Title>
                      <Button
                         variant="subtle"
                         size="sm"
                         onClick={() => handlePositionLink(selectedTechnique.originPositionId)}
                         style={{ whiteSpace: 'normal', height: 'auto' }}
                      >
                         {bjjKnowledgeBase.positions[selectedTechnique.originPositionId].name}
                      </Button>
                   </Group>
                </Box>
                
                <Text size="sm">{selectedTechnique.description}</Text>
                
                {selectedTechnique.steps && (
                  <Box>
                    <Title order={5} mb="xs">Steps:</Title>
                    <Stack component="ol" gap="xs">
                      {selectedTechnique.steps.map((step, index) => (
                        <Text component="li" size="sm" key={`step-${index}`}>{step}</Text>
                      ))}
                    </Stack>
                  </Box>
                )}
                
                {selectedTechnique.outcomes && selectedTechnique.outcomes.length > 0 && (
                  <Box>
                    <Title order={5} mb="xs">Possible Outcomes:</Title>
                    <Stack gap="sm">
                      {selectedTechnique.outcomes.map((outcome, index) => (
                        <Paper key={`outcome-${index}`} p="xs" withBorder radius="sm">
                          <Stack gap={4}>
                            <Text fw={500} size="sm">{outcome.type}</Text>
                            <Text size="sm">{outcome.description}</Text>
                            {outcome.endPositionId && (
                               <Group gap="xs" align="center">
                                <Text size="xs" c="dimmed">Position:</Text>
                                <Button
                                   variant="subtle"
                                   size="xs"
                                   onClick={() => handlePositionLink(outcome.endPositionId as ConcretePositionId)}
                                   style={{ whiteSpace: 'normal', height: 'auto' }}
                                >
                                  {bjjKnowledgeBase.positions[outcome.endPositionId].name}
                                </Button>
                               </Group>
                            )}
                            {outcome.likelihood && (
                              <Text size="xs" c="dimmed">Likelihood: {outcome.likelihood}</Text>
                            )}
                          </Stack>
                        </Paper>
                      ))}
                     </Stack>
                  </Box>
                )}
                
                {selectedTechnique.notes && (
                  <Box>
                    <Title order={5} mb="xs">Notes:</Title>
                    <Text size="sm">{selectedTechnique.notes}</Text>
                  </Box>
                )}
               </Stack>
            </Paper>
          )}

          {!selectedPosition && !selectedTechnique && (
             <Paper p="xl" radius="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Text c="dimmed">
                   Select a position or technique to view details
                </Text>
             </Paper>
          )}
         </ScrollArea>
      </AppShell.Aside>
    </AppShell>
  );
} 