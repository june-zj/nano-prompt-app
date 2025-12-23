<template>
  <div class="modal-overlay" v-if="modelValue" @click.self="handleOverlayClick">
    <div class="modal" :class="modalClass">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseModal",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    modalClass: {
      type: [String, Array, Object],
      default: "",
    },
    closeOnOverlay: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue", "close"],
  methods: {
    close() {
      this.$emit("update:modelValue", false);
      this.$emit("close");
    },
    handleOverlayClick() {
      if (!this.closeOnOverlay) return;
      this.close();
    },
  },
};
</script>
