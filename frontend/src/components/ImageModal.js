// This code is used to show a full-screen image preview after clicking a photo.
function ImageModal({ imageUrl, title, onClose }) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="image-modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>X</button>
        <h3>{title}</h3>
        <img src={imageUrl} alt={title} />
      </div>
    </div>
  );
}

export default ImageModal;
