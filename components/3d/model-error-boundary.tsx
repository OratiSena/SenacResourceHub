"use client";

import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary dedicado ao preview 3D. Necessário porque o `fallback` do
 * <Canvas> do react-three-fiber só cobre o caso de WebGL indisponível — um
 * erro de render dentro da cena (ex.: bug num modelo) precisa de um error
 * boundary React de verdade para não derrubar a página inteira.
 */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Erro ao carregar a visualização 3D:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
