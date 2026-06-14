interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-label="加载中">
      <div
        className={`${sizeMap[size]} rounded-full border-gray-200 dark:border-gray-700 border-t-blue-500 animate-spin`}
      />
      <span className="text-sm text-apple-gray dark:text-apple-dark-gray">加载中...</span>
    </div>
  );
}