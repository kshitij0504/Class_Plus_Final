import React from 'react';
const AttachmentViewer = ({ url, fileName, onClose }) => {
  function getFileNameFromFirebaseUrl(url) {
    const decodedUrl = decodeURIComponent(url); // Decodes any special characters in the URL
    return decodedUrl.substring(decodedUrl.lastIndexOf("/") + 1).split("?")[0];
  }
  const decodedUrl = url;
  const decodedFileName = getFileNameFromFirebaseUrl(url);
  console.log(decodedFileName);
  const fileType = decodedFileName.split(".").pop().toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
    fileType
  );
  const isPDF = fileType === "pdf";

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          {/* Display Original File Name */}
          <h3 className="font-semibold text-cyan-600">{decodedFileName}</h3>
          <button className="text-gray-600" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {/* Handle different file types */}
          {isImage && (
            <img
              src={decodedUrl}
              alt={decodedFileName}
              className="max-w-full mx-auto"
            />
          )}
          {isPDF && (
            <iframe
              src={decodedUrl}
              className="w-full h-full min-h-[600px]"
              title={decodedFileName}
            />
          )}
          {!isImage && !isPDF && (
            <div className="text-center py-8">
              <p>Preview not available for this file type</p>
              <a
                href={decodedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentViewer