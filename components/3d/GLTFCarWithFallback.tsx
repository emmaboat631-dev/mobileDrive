'use client';

import React, { Suspense } from 'react';
import { CarModel, type CarMaterialSpec, type CarSilhouette } from './CarModel';
import { GLTFCar } from './GLTFCar';

interface Props extends CarMaterialSpec {
  modelPath: string;
  autoRotate?: boolean;
  /** Silhouette for the procedural fallback. */
  fallbackSilhouette?: CarSilhouette;
}

interface State {
  error: boolean;
  retryWithLq: boolean;
}

/**
 * Error boundary that catches GLB load failures (missing file, parse error,
 * decoder missing, etc.) and renders the procedural CarModel in its place.
 * Without this, a stale `vehicle.modelPath` would crash the whole viewer.
 */
export class GLTFCarWithFallback extends React.Component<Props, State> {
  state: State = { error: false, retryWithLq: false };

  static getDerivedStateFromError(): State {
    return { error: true, retryWithLq: false };
  }

  componentDidCatch(err: unknown) {
    const { modelPath } = this.props;
    // If the HQ (desktop) model failed, try the 1k (mobile) sibling before
    // falling back to the procedural dummy.
    if (modelPath.endsWith('-hq.glb')) {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.warn('[mobileDrive] HQ GLB failed, retrying with 1k:', modelPath);
      }
      this.setState({ error: false, retryWithLq: true });
      return;
    }
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[mobileDrive] GLB failed to load, falling back to procedural car:', err);
    }
  }

  // Re-attempt the GLB if the modelPath changes (new vehicle picked).
  componentDidUpdate(prev: Props) {
    if (prev.modelPath !== this.props.modelPath && (this.state.error || this.state.retryWithLq)) {
      this.setState({ error: false, retryWithLq: false });
    }
  }

  render() {
    const { modelPath, fallbackSilhouette, ...spec } = this.props;
    const resolvedPath = this.state.retryWithLq ? modelPath.replace(/-hq\.glb$/, '.glb') : modelPath;

    if (this.state.error) {
      return <CarModel {...spec} silhouette={fallbackSilhouette} />;
    }

    // Show nothing while the real GLB is downloading — the outer ViewerLoading
    // handles the "preparing the showroom" state. Rendering the procedural car
    // here would flash a dummy before the real model appears.
    return (
      <Suspense fallback={null}>
        <GLTFCar {...spec} modelPath={resolvedPath} />
      </Suspense>
    );
  }
}
