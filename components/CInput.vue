<template>
  <div class="c-input":class="{'checkbox-center': props.type === 'checkbox'}" :data-validation-status="validationStatus || ''" :data-validation-message="validationMessage">
    <span v-if="props.title && props.type !== 'checkbox'" class="font-medium inline-block mb-1">{{ props.title }}</span><br v-if="props.autosize && props.title"/>
    <n-input ref="element" :class="{'autosized': props.autosize}" v-if="props.type === 'string' || props.type === 'number'" :autosize="props.autosize" v-model:value="/*@ts-ignore*/ value" type="text" :placeholder="props.placeholder" :disabled="props.disabled" :status="validationStatus" @focus="onFocus" @blur="onBlur"/>
    <n-checkbox v-else-if="props.type === 'checkbox'" v-model:checked="checked" :disabled="props.disabled">{{ props.title }}</n-checkbox>
    <n-select :class="{'select-autosize': props.autosize}" v-else-if="props.type === 'dropdown'" v-model:value="value" :options="options" :disabled="props.disabled" :multiple="props.multiple"/>
    <n-date-picker :class="{'select-autosize': props.autosize}" v-else-if="props.type === 'date'" v-model:formatted-value="/*@ts-ignore*/ value" value-format="yyyy-MM-dd" format="dd.MM.yyyy" type="date" :disabled="props.disabled"/>
    <n-date-picker :class="{'select-autosize': props.autosize}" v-else-if="props.type === 'datetime'" v-model:formatted-value="/*@ts-ignore*/ value" value-format="yyyy-MM-dd HH:mm:ss" format="dd.MM.yyyy HH:mm:ss" type="datetime" :disabled="props.disabled"/>
  </div>
</template>

<script setup lang="ts">
  import { useRuntimeConfig } from 'nuxt/app'
  import { onMounted, ref, watch } from 'vue'
  import { useTippy } from 'vue-tippy'
  import Joi from 'joi'

  const props = withDefaults(defineProps<{
    title?: string,
    type?: 'string' | 'number' | 'checkbox' | 'dropdown' | 'date' | 'datetime',
    autosize?: boolean,
    disabled?: boolean,
    validation?: Layer.InputValidators | Joi.Schema,
    required?: boolean,
    multiple?: boolean,
    placeholder?: string
  }>(), {
    type: 'string',
    validation: 'string',
    autosize: true,
    required: true
  })

  const element = ref()
  const validationStatus = ref<'success' | 'warning' | 'error' | undefined>(undefined)
  const validationMessage = ref('')
  const isTouched = ref(false)

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
      if(props.required) schema = schema?.required()

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
