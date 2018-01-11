window.addEventListener('load', e => {
  console.log('READY');
  document.querySelector('.continue').addEventListener('click', () => {
    document.querySelector('.splash').style.display = 'none';
    document.querySelector('.main').style.display = 'block';
    document.querySelector('.navbar').style.display = 'block';
  })
})