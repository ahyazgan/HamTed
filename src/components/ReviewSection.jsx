import { useState } from "react";
import { loadReviews, saveReviews } from "../utils/storage";
import { useToast } from "./Toast";

function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-input">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= (hover || value) ? "star-filled" : ""}`}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}>{"\u2605"}</span>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId, t }) {
  const toast = useToast();
  const allReviews = loadReviews();
  const reviews = allReviews.filter(r => r.productId === productId);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    if (!name.trim() || !comment.trim() || !rating) {
      toast("Tum alanlari doldurun", "error");
      return;
    }
    const newReview = { productId, name, comment, rating, date: new Date().toISOString() };
    saveReviews([...allReviews, newReview]);
    setShowForm(false);
    setName(""); setComment(""); setRating(0);
    toast("Yorumunuz eklendi!", "success");
  };

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="review-section">
      <div className="review-header">
        <h3 className="section-title">{t.product.reviews} ({reviews.length})</h3>
        {avg && <span className="review-avg">{"\u2605"} {avg}</span>}
        <button onClick={() => setShowForm(!showForm)} className="btn-sm btn-outline">{t.product.writeReview}</button>
      </div>

      {showForm && (
        <div className="review-form">
          <StarInput value={rating} onChange={setRating} />
          <input type="text" placeholder="Adiniz" value={name} onChange={e => setName(e.target.value)} className="form-input" style={{ marginBottom: 8 }} />
          <textarea placeholder="Yorumunuz..." rows={3} value={comment} onChange={e => setComment(e.target.value)} className="form-input form-textarea" style={{ marginBottom: 8 }} />
          <button onClick={handleSubmit} className="btn-primary">Gonder</button>
        </div>
      )}

      {reviews.length === 0 && !showForm && (
        <div style={{ color: "var(--text-ter)", fontSize: 13, padding: "16px 0" }}>Henuz yorum yok. Ilk yorumu siz yapin!</div>
      )}

      {reviews.map((r, i) => (
        <div key={i} className="review-item">
          <div className="review-item-head">
            <span className="review-name">{r.name}</span>
            <span className="review-stars">{"\u2605".repeat(r.rating)}{"\u2606".repeat(5 - r.rating)}</span>
            <span className="review-date">{new Date(r.date).toLocaleDateString("tr-TR")}</span>
          </div>
          <div className="review-comment">{r.comment}</div>
        </div>
      ))}
    </div>
  );
}
