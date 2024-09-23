import React, { useRef, useEffect } from "react";

const ContextMenu = ({ position, visible, onDelete, containerRef }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    if (menuRef.current && containerRef.current) {
      const { top, left } = containerRef.current.getBoundingClientRect();
      const menuStyle = menuRef.current.style;

      menuStyle.top = `${position.y - top}px`;
      menuStyle.left = `${position.x - left}px`;
    }
  }, [position, containerRef]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="absolute bg-gray-700 text-white rounded shadow-lg z-50"
    >
      <button
        className="block w-full px-4 py-2 text-left hover:bg-gray-600"
        onClick={onDelete}
      >
        Delete
      </button>
      <button
        className="block w-full px-4 py-2 text-left hover:bg-gray-600"
      >
        Edit
      </button>
    </div>
  );
};

export default ContextMenu;
