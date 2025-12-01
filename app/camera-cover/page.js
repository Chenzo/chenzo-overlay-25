import { Suspense } from 'react';
import CameraCoverContent from './CameraCoverContent';

export default function CameraCover() {
  return (
    <Suspense fallback={null}>
      <CameraCoverContent />
    </Suspense>
  );
}
