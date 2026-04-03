import React from 'react';
import Loader from './Loader';

interface SuspenseFallbackProps {
  fullScreen?: boolean;
  text?: string;
}

const SuspenseFallback: React.FC<SuspenseFallbackProps> = ({
  fullScreen = false,
  text = 'Loading...',
}) => {
  if (fullScreen) {
    return <Loader fullScreen variant="spinner" size="lg" text={text} />;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader variant="spinner" size="lg" text={text} />
    </div>
  );
};

export default SuspenseFallback;
