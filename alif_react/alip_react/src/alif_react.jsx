import React, { useEffect, useState } from 'react';

function AnimatedBox() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, 1000); // Menunggu 1 detik sebelum menampilkan kotak
  }, []);

  return (
    <div>
      {visible && (
        <div style={{ width: '100px', height: '100px', backgroundColor: 'blue', transition: 'opacity 1s', opacity: visible ? 1 : 0 }}>
          Saya muncul dengan animasi!
        </div>
      )}
    </div>
  );
}

export default AnimatedBox;
