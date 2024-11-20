<template>
  <div class="c-input" :style="{ display: props.display }" :class="{'checkbox-center': props.type === 'checkbox'}">
    <span v-if="props.title && props.type !== 'checkbox'" class="font-medium inline-block mb-1">{{ props.title }}</span><br v-if="props.autosize && props.title"/>
    <n-input v-bind="$attrs" ref="element" :class="{'autosized': props.autosize}" v-if="props.type === 'string' || props.type === 'number'" :autosize="props.autosize" v-model:value="/*@ts-ignore*/ value" type="text" :placeholder="props.placeholder" :disabled="props.disabled" :status="validationStatus" @focus="onFocus" @blur="onBlur"/>
    <n-checkbox v-bind="$attrs" v-else-if="props.type === 'checkbox'" v-model:checked="checked" :disabled="props.disabled">{{ props.title }}</n-checkbox>
    <n-select v-bind="$attrs" :class="{'select-autosize': props.autosize}" v-else-if="props.type === 'dropdown'" v-model:value="value" :options="options" :disabled="props.disabled" :multiple="props.multiple"/>
    <n-date-picker v-bind="$attrs" :class="{'select-autosize': props.autosize}" v-else-if="props.type === 'date'" v-model:formatted-value="/*@ts-ignore*/ value" value-format="yyyy-MM-dd" format="dd.MM.yyyy" type="date" :disabled="props.disabled" :placeholder="props.placeholder" :update-value-on-close="true"/>
    <n-date-picker v-bind="$attrs" :class="{'select-autosize': props.autosize}" v-else-if="props.type === 'datetime'" v-model:formatted-value="/*@ts-ignore*/ value" value-format="yyyy-MM-dd HH:mm:ss" format="dd.MM.yyyy HH:mm:ss" type="datetime" :disabled="props.disabled" :placeholder="props.placeholder" :update-value-on-close="true"/>
  </div>
</template>

<script setup lang="ts">
  import { useRuntimeConfig } from 'nuxt/app'
  import { useTippy } from 'vue-tippy'
  import Joi from 'joi'

  defineOptions({
    inheritAttrs: false
  })

  const props = withDefaults(defineProps<{
    title?: string,
    type?: 'string' | 'number' | 'checkbox' | 'dropdown' | 'date' | 'datetime',
    autosize?: boolean,
    disabled?: boolean,
    validation?: Layer.InputValidators | Joi.Schema,
    required?: boolean,
    multiple?: boolean,
    placeholder?: string,
    size?: 'small' | 'medium' | 'large',
    display?: 'block' | 'inline-block'
  }>(), {
    type: 'string',
    validation: 'string',
    autosize: true,
    required: true,
    size: 'medium',
    display: 'inline-block',
  })

  const element = ref()
  const validationStatus = ref<Layer.InputStatus>('success')
  const validationMessage = ref('')
  const isTouched = ref(false)

  const formErrors = inject<Ref<{ el: HTMLElement, message: Ref<string> }[]>>('formErrors', ref([]))

  const value = defineModel<string | string[] | number | number[]>({
    set(n: string | string[] | number | number[]) {
      return props.type === 'number' && !Number.isNaN(Number(n)) && n !== '' && n !== '-' ? Number(n) : n
    }
  })
  const checked = defineModel<boolean>('checked')
  const options = defineModel<{ label: string, value: string | number, disabled?: boolean }[]>('options')

  let tippy: any = undefined

  onMounted(() => { if(props.type === 'string' || props.type === 'number') {
    tippy = useTippy(element.value.inputElRef, { theme: 'error' })

    if(props.validation) {
      let schema: Joi.Schema | undefined = undefined

      if(props.validation === 'number') {
        schema = Joi.number()
      }
      else if(props.validation === 'number-positive') {
        schema = Joi.number().positive()
      }
      else if (props.validation === 'string') {
        schema = Joi.string().regex(/^[A-Za-z\u0400-\u04FF\s'"]+$/)
      }
      else if (props.validation === 'string-cyrillic') {
        schema = Joi.string().regex(/^[\u0400-\u04FF\s'"]+$/)
      }
      else if (props.validation === 'string-latin') {
        schema = Joi.string().regex(/^[A-Za-z]+$/)
      }
      else {
        schema = props.validation
      }
      schema = props.required ? schema?.required(): schema?.empty('')

      if(typeof props.validation !== 'object') {
        const joiSetup = useRuntimeConfig().public.joiSetup
        if(joiSetup.locales === 'custom' && Object.keys(joiSetup.messages).length > 0) throw new Error('Custom messages for Joi is not defined')

        schema = schema.messages(joiSetup.locales === 'custom'
          ? { ...joiSetup.messages.base, ...joiSetup.messages.validators[props.validation] }
          : getJoiMessagesByLocale(joiSetup.locales, props.validation)
        )
      }

      watch(value, n => {
        const result = schema?.validate(n)
        const error = result?.error?.message ?? ''

        tippy.setContent(error)
        tippy[error ? 'show' : 'hide']()
        validationStatus.value = error ? 'error' : 'success'
        validationMessage.value = error
      })

      formErrors?.value.push({ el: element.value.inputElRef, message: validationMessage })
    }
  }})

  const onFocus = () => isTouched.value = true
  const onBlur = () => isTouched.value = false
</script>

<style lang="scss">
  .autosized {
    min-width: 250px !important;
  }

  .select-autosize {
    width: 250px !important;
  }

  .checkbox-center {
    display: flex;
    align-items: center;
  }
</style>
