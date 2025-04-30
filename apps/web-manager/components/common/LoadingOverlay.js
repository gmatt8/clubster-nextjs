// components/common/LoadingOverlay.js
export default function LoadingOverlay() {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600 border-solid"></div>
      </div>
    );
  }
  