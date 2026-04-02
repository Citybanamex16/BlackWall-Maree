/* eslint-env browser */
/* global alert */

document.addEventListener('DOMContentLoaded', () => {
    cargarPromociones();
    configurarCheckboxDescuento();
});


const cargarPromociones = async () => {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('is-hidden');

    try {
        const response = await fetch('/promos/promociones/api/all'); 
        const result = await response.json();

        if (result.success) {
            renderizarPromociones(result.data);
        }
    } catch (error) {
        console.error('Error al cargar promos:', error);
    } finally {
        if (spinner) spinner.classList.add('is-hidden');
    }
};

function renderizarPromociones(lista) {
    const contenedor = document.getElementById('contenedor-promociones');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = '<p class="column is-full has-text-centered">No hay promociones registradas.</p>';
        return;
    }

    lista.forEach(promo => {
        const statusTag = promo.Activo
            ? '<span class="tag is-success is-light">Sí</span>'
            : '<span class="tag is-danger is-light">No</span>';
        
        const cardHTML = `
      <div class="column is-4">
        <div class="card">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">${promo.Nombre}</p>
                <div class="has-text-right">
                    <p class="is-size-7 has-text-grey is-uppercase mb-1">Activo</p>
                    ${statusTag}
                </div>
              </div>
            </div>
            <div class="content">
              ${promo.Condiciones || 'Sin condición disponible.'}
            </div>
            <hr class="my-4" style="background-color: #f5f5f5; height: 1px;">
            <div class="is-flex is-justify-content-space-between is-align-items-center">
                <div>
                    <p class="is-size-7 has-text-grey-lighter is-uppercase">Vigencia</p>
                    <span class="event-date-tag">${promo.Fecha_inicio} - ${promo.Fecha_final}</span>
                </div>
            </div>
          </div>
          <footer class="card-footer">
            <a href="#" class="card-footer-item has-text-link" onclick="prepararModificacion(${promo.ID_Promocion})">
              Modificar
            </a>
          </footer>
        </div>
      </div>`;
        contenedor.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// --- LÓGICA DE REGISTRO Y MODAL (COMPAÑERO) ---

const abrirModal = () => {
    document.getElementById('modal-promocion').classList.add('is-active');
};

const cerrarModal = () => {
    document.getElementById('modal-promocion').classList.remove('is-active');
    limpiarFormulario();
};

const configurarCheckboxDescuento = () => {
    const checkbox = document.getElementById('check-descuento');
    const seccion = document.getElementById('seccion-descuento');
    const inputDescuento = document.getElementById('descuento');

    if (checkbox) {
        checkbox.addEventListener('change', function () {
            seccion.style.display = this.checked ? 'block' : 'none';
            if (!this.checked) inputDescuento.value = '';
        });
    }
};

const actualizarProductos = async () => {
    const categoria = document.querySelector('select[name="categoria"]').value;
    const tipo = document.querySelector('select[name="tipo"]').value;

    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (tipo) params.append('tipo', tipo);

    try {
        const res = await fetch(`/promos/promociones/producto-filtro?${params.toString()}`);
        const data = await res.json();
        const selectProductos = document.getElementById('select-productos');
        selectProductos.innerHTML = '';

        if (!data.success || data.data.length === 0) {
            selectProductos.innerHTML = '<option value="">Sin resultados</option>';
            return;
        }

        data.data.forEach(producto => {
            const label = document.createElement('label');
            label.className = 'checkbox';
            label.style.display = 'block';
            label.innerHTML = `
                <input type="checkbox" value="${producto.ID_Producto}" 
                       data-nombre="${producto.Nombre}" class="checkbox-producto mr-2">
                ${producto.Nombre}
            `;
            selectProductos.appendChild(label);
        });
    } catch (error) {
        console.error('Error al filtrar productos:', error);
    }
};

const guardarPromocion = () => {
    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        descuento: document.getElementById('descuento').value.trim(),
        condicion: document.getElementById('condiciones').value.trim(),
        fechaInicio: document.getElementById('fecha_de_Inicio').value,
        fechaFinal: document.getElementById('fecha_de_Fin').value,
        productos: Array.from(document.querySelectorAll('.checkbox-producto:checked')).map(cb => ({
            id: cb.value,
            nombre: cb.dataset.nombre
        }))
    };

    if (!validarFormulario(datos)) return;

    const btnGuardar = document.querySelector('#form-promocion .button.is-primary');
    btnGuardar.classList.add('is-loading');

    fetch('/promos/promociones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            cerrarModal();
            document.getElementById('modal-exito').classList.add('is-active');
            cargarPromociones(); // Recargar la lista sin refrescar página
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(err => console.error('Error:', err))
    .finally(() => btnGuardar.classList.remove('is-loading'));
};

function validarFormulario(datos) {
    // Limpieza de errores previos
    document.querySelectorAll('.input, .select').forEach(el => el.classList.remove('is-danger'));
    document.querySelectorAll('.help.is-danger').forEach(el => el.remove());

    let esValido = true;
    if (!datos.nombre) { marcarError('nombre', 'Obligatorio'); esValido = false; }
    if (document.getElementById('check-descuento').checked && !datos.descuento) {
        marcarError('descuento', 'Obligatorio'); esValido = false;
    }
    if (!datos.condicion) { marcarError('condiciones', 'Obligatorio'); esValido = false; }
    if (!datos.fechaInicio) { marcarError('fecha_de_Inicio', 'Requerido'); esValido = false; }
    if (!datos.fechaFinal) { marcarError('fecha_de_Fin', 'Requerido'); esValido = false; }

    return esValido;
}

function marcarError(id, mensaje) {
    const elemento = document.getElementById(id);
    elemento.classList.add('is-danger');
    const help = document.createElement('p');
    help.className = 'help is-danger';
    help.textContent = mensaje;
    elemento.closest('.control').appendChild(help);
}

const limpiarFormulario = () => {
    document.getElementById('form-promocion').reset();
    document.getElementById('seccion-descuento').style.display = 'none';
};