"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <p className="text-red-400 text-sm mb-2">Something went wrong.</p>
          <p className="text-card-ink-muted text-xs">{this.state.error}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 text-xs text-accent-strong underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
