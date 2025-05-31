import Swal from 'sweetalert2';


//#3085d6
const showAlert = (message) => {
    return Swal.fire({
        title: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2f44ef',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar',
    }).then((result) => {
        return result.isConfirmed;
    });
};


export default showAlert