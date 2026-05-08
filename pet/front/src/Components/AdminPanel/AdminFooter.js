import React from 'react';

const AdminFooter = () => {
  const footerStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '2rem 0',
    textAlign: 'center',
    marginTop: '2rem',
    position: 'relative',
    overflow: 'hidden',
    backgroundSize: '30px 30px'
  };

  return (
    <footer style={footerStyle}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p>© {new Date().getFullYear()} Medcoding. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default AdminFooter;