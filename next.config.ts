import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Evita que `next dev` sobrescreva CLAUDE.md com instruções genéricas do framework —
  // este projeto já mantém seu próprio CLAUDE.md com decisões do projeto.
  agentRules: false,
};

export default nextConfig;
