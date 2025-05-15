import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function Feed({ feedItems, onTry }) {
  return (
    <Swiper
      direction="vertical"
      slidesPerView={1}
      spaceBetween={0}
      mousewheel
      style={{ height: '100vh' }}
    >
      {feedItems.map(item => (
        <SwiperSlide key={item.id}>
          <div
            style={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#fff',
              position: 'relative'
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: '100vw',
                height: '70vh',
                objectFit: 'contain',
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              paddingLeft: '7vw',
              paddingRight: '7vw',
              boxSizing: 'border-box'
            }}>
              <img src={item.avatar} alt="
              " style={{
                width: 48, height: 48, borderRadius: '50%', border: '2px solid #fff'
              }} />
              <div style={{ color: "#222" }}>
                <div style={{ fontWeight: 700, fontSize: 22 }}>{item.title}</div>
                <div style={{ fontSize: 16 }}>{item.desc}</div>
              </div>
              <button
                style={{
                  background: '#ff006c',
                  color: 'black',
                  border: 'none',
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 20,
                  padding: '14px 28px',
                  cursor: 'pointer',
                  marginLeft: 12
                }}
                onClick={() => onTry(item.overlayKey)}
              >
                try
              </button>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}