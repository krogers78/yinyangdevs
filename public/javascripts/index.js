if (document.querySelector('form')) {
  document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    let id = document.querySelector('#id').value
  
    // send a put request to the server with all the form data
    $.ajax({
     url: '/inventory/edit-item/save/' + id,
     method: 'put',
     data: $('form').serialize(),
      success: window.location.replace('/user/admin')
    })
  })
}