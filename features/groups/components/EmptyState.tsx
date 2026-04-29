const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center mt-4">
      <h3 className="text-lg font-semibold text-white">No groups yet</h3>

      <p className="text-sm text-gray-400 mt-1">
        Create your first group to start splitting expenses
      </p>
    </div>
  );
};

export default EmptyState;
