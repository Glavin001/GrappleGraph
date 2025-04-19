# GrappleGraph: Master BJJ with a Visual Edge

## About The Project

### The Problem
Learning Brazilian Jiu-Jitsu involves understanding a complex web of positions, transitions, submissions, and escapes. Traditional methods like linear instruction or simple flashcards often fail to capture the dynamic, interconnected nature of grappling exchanges. It's hard to visualize how moves link positions or understand the best options available in a specific scenario.

### Our Solution
GrappleGraph aims to be the ultimate BJJ learning tool by representing Jiu-Jitsu as an interactive graph:

*   **Nodes = Positions:** Each distinct position (e.g., Closed Guard, Mount, Side Control, specific Open Guard variations) is a node in the graph.
*   **Edges = Moves/Transitions:** Each action (e.g., sweep, submission, pass, escape, takedown) that moves between positions, or applies an attack within a position, is a directed edge.

## Key Features (Planned)

1.  **Comprehensive Knowledge Base:**
    *   Detailed descriptions of BJJ positions, including variations and key control points.
    *   Step-by-step instructions for moves (sweeps, submissions, passes, escapes, takedowns).
    *   Metadata for positions and moves: difficulty, necessary attributes (strength, flexibility), common counters, gi/no-gi specificity, situational relevance.
2.  **Interactive Graph Visualization:**
    *   Visually explore the connections between positions and moves.
    *   Filter the graph based on criteria (e.g., show only sweeps from Closed Guard, show high-percentage submissions from Mount).
3.  **Rich Media Integration:**
    *   Embedded images and videos (e.g., YouTube links) demonstrating each position and move.
4.  **Personalized Learning Paths:**
    *   Track learned techniques and positions.
    *   Suggest relevant techniques based on current knowledge or problem areas.
    *   Filter moves based on user-defined constraints (e.g., flexibility limitations).
5.  **Scenario Analysis:**
    *   Identify your current position and explore potential offensive and defensive options.
    *   Understand common sequences and counters ("If I'm here and they do X, what are my options?").

## Data Structure
We are building the knowledge base using a structured format (likely JSON, see `bjj_data.json`) containing detailed information about positions and moves, designed to power the graph visualization and application logic.

## Project Status

### Current Status
*   Initial research phase: Defining core positions and moves.
*   Developing the data structure (`bjj_data.json`).
*   Populating the initial dataset with fundamental techniques and positions.

### Next Steps
*   Continue populating the dataset with more positions, moves, attributes, and visual aids.
*   Refine the data structure based on ongoing research.
*   Begin development of the application interface and graph visualization components.

## Getting Started

This project is built with [Next.js](https://nextjs.org).

### Prerequisites

Ensure you have Node.js and npm installed.

### Installation & Running Locally

1. Install NPM packages
   ```sh
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

You can start editing the main page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Resources & Learn More

To learn more about Next.js, take a look at the following resources:

*   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
*   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
*   [Next.js GitHub repository](https://github.com/vercel/next.js) - feedback and contributions are welcome!
