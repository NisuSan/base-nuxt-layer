export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive<HTMLElement, Layer.ValidationDirective>('validation', (el, binding) => {
    const validationData = Array.from(el.children)
      .filter(c => c.classList.contains('c-input'))
      .map(el => ({
        el,
        status: (el as HTMLElement).dataset.validationStatus || '',
        message: (el as HTMLElement).dataset.validationMessage || '',
      }))

    // binding.value.errors = [ ...binding.value.errors, ...validationData.filter(d => d.status === 'error').map(d => ({ el: d.el as HTMLElement, message: d.message })) ]
    binding.value.state = validationData.some(d => d.status === 'error') ? 'error' : 'success'
  })
})
