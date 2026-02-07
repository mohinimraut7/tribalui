export default function Loader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center z-50">
      
      {/* Spinner */}
      <div className="relative mb-4">
        <div className="h-14 w-14 rounded-full border-4 border-blue-200"></div>
        <div className="h-14 w-14 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>

      {/* Text */}
      {/* <p className="text-blue-700 font-semibold text-lg animate-pulse">
        Signing you in...
      </p> */}

    </div>
  );
}
