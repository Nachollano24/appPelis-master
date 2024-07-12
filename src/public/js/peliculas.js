let form = document.querySelector('#createPelicula');
if (form) {
    let btn = document.querySelector('#create-pelicula');
    let titulo = document.querySelector('#titulo');
    let tituloError = document.querySelector('#titulo-error');
    let descripcion = document.querySelector('#descripcion');
    let descripcionError = document.querySelector('#descripcion-error');
    let imagen = document.querySelector('#imagen');
    let imagenError = document.querySelector('#imagen-error');


    btn.onclick = (e) => {
        e.preventDefault();
        let hasError = false;

        tituloError.style.display = 'none';
        descripcionError.style.display = 'none';
        imagenError.style.display = 'none';

        if (!titulo.value) {
            tituloError.style.display = 'block';
            hasError = true;
        }
        if (!descripcion.value) {
            descripcionError.style.display = 'block';
            hasError = true;
        }

        if (!imagen.value) {
            imagenError.style.display = 'block';
            hasError = true;
        }

        if (!hasError) {
            form.submit();
        }
    }    
}