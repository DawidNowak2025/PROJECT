// This code is used to display clicked images in a full-screen modal.
function ImageModal({ imageUrl, title, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>X</button>
        <img src={imageUrl} alt={title} />
        <p>{title}</p>
      </div>
    </div>
  );
}

export default ImageModal;
