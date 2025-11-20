"use client"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const getPaginationRange = (currentPage, totalPages) => {
    const delta = 2; // Number of pages to show around the current page
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1); // Always include the first page

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    range.push(totalPages); // Always include the last page

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    for (let i of uniqueRange) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  const pagesToDisplay = getPaginationRange(currentPage, totalPages);

  const goToPrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const goToNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  return (
    <div className="flex justify-center my-6">
      <nav className="inline-flex gap-1">
        <button
          onClick={goToPrev}
          disabled={currentPage === 1}
          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-white text-gray-700 hover:bg-[#D3202D] hover:text-white border-gray-300"
          }`}
        >
          Previous
        </button>

        {pagesToDisplay.map((page, index) => (
          page === '...' ? (
            <span key={`dots-${index}`} className="px-3 py-2 text-gray-700">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-[#D3202D] text-white "
                  : "bg-white text-gray-700 hover:bg-[#D3202D] hover:text-white border-gray-300 "
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-white text-gray-700 hover:bg-[#D3202D] hover:text-white border-gray-300 hover:bg-[#D3202D]"
          }`}
        >
          Next
        </button>
      </nav>
    </div>
  )
}

export default Pagination
