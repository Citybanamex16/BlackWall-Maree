document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login')
  const formSignup = document.getElementById('form-signup')
  const formOtp = document.getElementById('form-otp')
  const panelOtp = document.getElementById('panel-otp')

  const tabLogin = document.getElementById('tab-login')
  const tabSignup = document.getElementById('tab-signup')
  const mainTitle = document.getElementById('main-title')
  const alertBox = document.getElementById('alert-box')
  const successBox = document.getElementById('success-box')
  const passwordField = document.getElementById('password-field')
  const tabsContainer = document.getElementById('tabs-container')

  const btnLogin = document.getElementById('btn-login');
  const btnSignup = document.getElementById('btn-signup');
  const btnOtp = document.getElementById('btn-otp');
  const checkPrivacidad = document.getElementById('aceptoPrivacidad');


// LÓGICA DE VALIDACIÓN
  const validateForm = (form, submitBtn) => {
    const inputs = Array.from(form.querySelectorAll('input[required], select[required]'));
    
    const allFilled = inputs.every(input => {
      return input.value.trim() !== '';
    });

    let privacyAccepted = true;
    if (form.id === 'form-signup' && checkPrivacidad) {
        privacyAccepted = checkPrivacidad.checked;
    }

    submitBtn.disabled = !allFilled;
  };

  const formsToWatch = [
    { form: formLogin, btn: btnLogin },
    { form: formSignup, btn: btnSignup },
    { form: formOtp, btn: btnOtp }
  ];

  formsToWatch.forEach(({ form, btn }) => {
    form.addEventListener('input', () => validateForm(form, btn));

    if (form.id === 'form-signup' && checkPrivacidad) {
        checkPrivacidad.addEventListener('change', () => validateForm(form, btn));
    }
  });

  // Función global para mostrar alertas
  const showAlert = (msg, type = 'danger') => {
    if (type === 'danger') {
      alertBox.innerText = msg
      alertBox.classList.remove('is-hidden')
      successBox.classList.add('is-hidden')
    } else {
      successBox.innerText = msg
      successBox.classList.remove('is-hidden')
      alertBox.classList.add('is-hidden')
    }
  }

  const hideAlerts = () => {
    alertBox.classList.add('is-hidden')
    successBox.classList.add('is-hidden')
  }

  // Función para cambiar entre Login y Sign Up
  const switchMode = (mode) => {
    hideAlerts()
    if (mode === 'login') {
      tabLogin.classList.add('active')
      tabSignup.classList.remove('active')
      formLogin.classList.remove('is-hidden')
      formSignup.classList.add('is-hidden')
      mainTitle.innerText = 'Iniciar Sesión'
    } else {
      tabSignup.classList.add('active')
      tabLogin.classList.remove('active')
      formSignup.classList.remove('is-hidden')
      formLogin.classList.add('is-hidden')
      mainTitle.innerText = 'Crear Cuenta'
    }
  }

  // Eventos de las pestañas
  tabLogin.addEventListener('click', () => switchMode('login'))
  tabSignup.addEventListener('click', () => switchMode('signup'))

  // Función genérica para hacer POST
  const fetchAPI = async (url, formElement) => {
    hideAlerts()
    const data = Object.fromEntries(new FormData(formElement).entries())

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()

      if (res.status === 500 && result.redirectUrl) {
        window.location.href = result.redirectUrl
        return null
      }

      return { status: res.status, data: result }
    } catch (error) {
      showAlert('Error de red al conectar con el servidor.')
      return null
    }
  }

  // --- SUBMIT DE LOGIN ---
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault()
    const response = await fetchAPI('/cliente/login', formLogin)
    if (!response) return

    if (response.status === 200 && response.data.redirectUrl) {
      window.location.href = response.data.redirectUrl
    } else if (response.status === 200 && response.data.requirePassword) {
      passwordField.classList.remove('is-hidden')
      formLogin.querySelector('input[name="password"]').required = true
    } else if (response.status === 200 && response.data.otpStep) {
      mostrarOTP(formLogin.querySelector('input[name="telefono"]').value, response.data.debugCode)
    } else {
      showAlert(response.data.error)
      if (response.data.action === 'switch_to_signup') {
        formSignup.querySelector('input[name="telefono"]').value = formLogin.querySelector('input[name="telefono"]').value
        switchMode('signup')
      }
    }
  })

  // --- SUBMIT DE SIGNUP ---
  formSignup.addEventListener('submit', async (e) => {
    e.preventDefault()
    const response = await fetchAPI('/cliente/signup', formSignup)
    if (!response) return

    if (response.status === 201 && response.data.otpStep) {
      showAlert(response.data.message, 'success')
      mostrarOTP(formSignup.querySelector('input[name="telefono"]').value, response.data.debugCode)
    } else {
      showAlert(response.data.error)
      if (response.data.action === 'switch_to_login') {
        formLogin.querySelector('input[name="telefono"]').value = formSignup.querySelector('input[name="telefono"]').value
        switchMode('login')
      }
    }
  })

  formOtp.addEventListener('submit', async (e) => {
    e.preventDefault()
    const response = await fetchAPI('/cliente/login/verify', formOtp)
    if (!response) return

    if (response.status === 200 && response.data.redirectUrl) {
      window.location.href = response.data.redirectUrl
    } else {
      showAlert(response.data.error)
    }
  })

  const mostrarOTP = (telefono, debugCode) => {
    formLogin.classList.add('is-hidden')
    formSignup.classList.add('is-hidden')
    tabsContainer.classList.add('is-hidden')
    mainTitle.innerText = 'Verificación Requerida'

    document.getElementById('otp-phone-text').innerText = `Código enviado al: ${telefono}`
    if (debugCode) {
      document.getElementById('debug-code-box').classList.remove('is-hidden')
      document.getElementById('debug-code-text').innerText = debugCode
    }
    panelOtp.classList.remove('is-hidden')
  }
})
