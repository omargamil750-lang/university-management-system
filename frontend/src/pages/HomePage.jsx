function HomePage() {
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1>University Management System</h1>
        <p>Welcome to the UMS platform.</p>
        <p>Use the navigation bar to register or log in.</p>
      </div>
    </div>
  );
}

const pageStyle = {
  padding: "40px",
  display: "flex",
  justifyContent: "center",
};

const cardStyle = {
  width: "100%",
  maxWidth: "700px",
  padding: "30px",
  border: "1px solid #ddd",
  borderRadius: "14px",
  background: "white",
};

export default HomePage;