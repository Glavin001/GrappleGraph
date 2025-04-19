import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-2">GrappleGraph</h1>
          <p className="text-xl mb-6">Master BJJ with a Visual Edge</p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-indigo-600 text-white gap-2 hover:bg-indigo-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/graph"
          >
            Explore BJJ Graph
          </Link>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="https://github.com/GrappleGraph/GrappleGraph"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository
          </a>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl mt-4">
          <h2 className="text-xl font-bold mb-4">About GrappleGraph</h2>
          <p className="mb-4">
            GrappleGraph aims to be the ultimate BJJ learning tool by representing Jiu-Jitsu as an interactive graph:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Nodes = Positions:</strong> Each distinct position (e.g., Closed Guard, Mount, Side Control) is a node in the graph.</li>
            <li><strong>Edges = Moves/Transitions:</strong> Each action (e.g., sweep, submission, pass, escape) that moves between positions is a directed edge.</li>
          </ul>
          <p>
            Visualize techniques, explore connections, and understand the flow of BJJ positions and transitions.
          </p>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/graph"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="Graph icon"
            width={16}
            height={16}
          />
          Explore Graph
        </Link>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/GrappleGraph/GrappleGraph"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="GitHub icon"
            width={16}
            height={16}
          />
          GitHub
        </a>
      </footer>
    </div>
  );
}
