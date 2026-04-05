import { Component } from "react";
import { Link } from "react-router-dom";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="page-content">
          <div className="order-confirm-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u26A0"}</div>
            <h1 className="page-title">Bir hata olustu</h1>
            <p style={{ color: "var(--text-sec)", marginTop: 8, marginBottom: 24 }}>
              Sayfa yuklenirken beklenmeyen bir hata meydana geldi.
            </p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }}
              className="btn-primary btn-lg">Ana Sayfaya Don</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function NotFoundPage() {
  return (
    <div className="page-content">
      <div className="order-confirm-card">
        <div style={{ fontSize: 72, fontWeight: 900, color: "var(--accent)", marginBottom: 8 }}>404</div>
        <h1 className="page-title">Sayfa Bulunamadi</h1>
        <p style={{ color: "var(--text-sec)", marginTop: 8, marginBottom: 24 }}>
          Aradiginiz sayfa mevcut degil veya kaldirilmis olabilir.
        </p>
        <Link to="/" className="btn-primary btn-lg">Ana Sayfaya Don</Link>
      </div>
    </div>
  );
}
