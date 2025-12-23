<template>
  <BaseModal
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="生成历史记录"
    width="700px"
  >
    <el-table
      v-if="items.length > 0"
      :data="items"
      size="small"
      style="width: 100%"
    >
      <el-table-column label="图片" width="90">
        <template #default="scope">
          <el-image
            :src="scope.row.image"
            fit="cover"
            style="
              width: 60px;
              height: 60px;
              border-radius: 8px;
              cursor: pointer;
            "
            @click="$emit('preview', scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column label="时间" width="160">
        <template #default="scope">
          {{ formatTime(scope.row.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-space>
            <el-button size="small" @click="$emit('preview', scope.row)"
              >预览</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="$emit('delete', scope.$index)"
              >删除</el-button
            >
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="暂无生成记录" />

    <template #footer>
      <el-button v-if="items.length > 0" @click="$emit('clear')"
        >清空历史</el-button
      >
      <el-button type="primary" @click="$emit('update:modelValue', false)"
        >关闭</el-button
      >
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from "../BaseModal.vue";

export default {
  name: "HistoryDialog",
  components: {
    BaseModal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "preview", "delete", "clear"],
  methods: {
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>
