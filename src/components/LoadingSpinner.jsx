const LoadingSpinner = ({ fullScreen = false, size = 40 }) => {
  const spinner = (
    <div className="spinner" style={{ width: size, height: size }}>
      <div className="spinner-ring" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          <div className="loading-logo">✦</div>
          <div className="loading-text">AI Study Assistant</div>
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
