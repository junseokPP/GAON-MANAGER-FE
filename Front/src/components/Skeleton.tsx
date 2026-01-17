import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #e0e0e0 40px,
    #f0f0f0 80px
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

export const SkeletonTable = () => {
  return (
    <div>
      <SkeletonBase style={{ height: '40px', marginBottom: '8px' }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonBase key={i} style={{ height: '48px', marginBottom: '8px' }} />
      ))}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div style={{ padding: '24px' }}>
      <SkeletonBase style={{ height: '24px', width: '200px', marginBottom: '16px' }} />
      <SkeletonBase style={{ height: '16px', width: '100%', marginBottom: '8px' }} />
      <SkeletonBase style={{ height: '16px', width: '80%', marginBottom: '8px' }} />
      <SkeletonBase style={{ height: '16px', width: '90%' }} />
    </div>
  );
};

export const SkeletonText = ({ width = '100%', height = '16px' }: { width?: string; height?: string }) => {
  return <SkeletonBase style={{ width, height }} />;
};







