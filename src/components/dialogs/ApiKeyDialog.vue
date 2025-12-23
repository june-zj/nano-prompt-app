<template>
  <BaseModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="设置 API Key"
    width="400px"
    modal-class="api-key-modal"
  >
    <div class="api-key-register">
      <p>还没有 API Key？</p>
      <a
        href="https://api.chatfire.site/login?inviteCode=B466100C"
        target="_blank"
        class="register-link"
      >
        👉 点击这里注册获取密钥
      </a>
      <p class="register-hint">
        注册登录后即可获取密钥，复制粘贴到下方即可使用
      </p>
    </div>

    <el-input
      :model-value="apiKeyInput"
      @update:modelValue="$emit('update:apiKeyInput', $event)"
      type="password"
      show-password
      placeholder="请输入您的 API Key"
    />

    <p class="api-key-hint">API Key 将保存在本地浏览器中，不会上传到服务器</p>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="$emit('save')">保存</el-button>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from "../BaseModal.vue";

export default {
  name: "ApiKeyDialog",
  components: {
    BaseModal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    apiKeyInput: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "update:apiKeyInput", "save"],
};
</script>
