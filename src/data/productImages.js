// SVG placeholder icons per category
export const CAT_IMAGES = {
  celik: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="12" fill="#C85A2412"/><path d="M20 55V25h40v30H20z" stroke="#C85A24" stroke-width="2" fill="#C85A2408"/><path d="M28 35h24M28 42h24M28 49h16" stroke="#C85A24" stroke-width="1.5" stroke-linecap="round"/><circle cx="56" cy="28" r="3" fill="#C85A24"/></svg>`,
  cimento: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="12" fill="#3D8B4F12"/><path d="M25 55l15-30 15 30H25z" stroke="#3D8B4F" stroke-width="2" fill="#3D8B4F08"/><rect x="35" y="42" width="10" height="13" stroke="#3D8B4F" stroke-width="1.5"/><path d="M20 55h40" stroke="#3D8B4F" stroke-width="2" stroke-linecap="round"/></svg>`,
  kimyasal: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="12" fill="#2E6FA312"/><path d="M32 22v16l-8 18h32l-8-18V22" stroke="#2E6FA3" stroke-width="2" fill="#2E6FA308"/><path d="M30 22h20" stroke="#2E6FA3" stroke-width="2" stroke-linecap="round"/><circle cx="36" cy="48" r="2" fill="#2E6FA3"/><circle cx="44" cy="44" r="2" fill="#2E6FA3"/></svg>`,
  tekstil: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="12" fill="#7B509012"/><circle cx="40" cy="40" r="18" stroke="#7B5090" stroke-width="2" fill="#7B509008"/><path d="M40 22v36M28 28c8 8 16 8 24 0M28 52c8-8 16-8 24 0" stroke="#7B5090" stroke-width="1.5"/></svg>`,
  gida: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="12" fill="#A0782812"/><path d="M40 20c0 0-20 14-20 32h40c0-18-20-32-20-32z" stroke="#A07828" stroke-width="2" fill="#A0782808"/><path d="M40 20v-4M36 22l-4-6M44 22l4-6" stroke="#A07828" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  enerji: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="12" fill="#B0423A12"/><path d="M44 18L30 42h12l-6 20 20-26H44l6-18z" stroke="#B0423A" stroke-width="2" fill="#B0423A08"/></svg>`,
};

export function getProductImage(cat) {
  return CAT_IMAGES[cat] || CAT_IMAGES.celik;
}
