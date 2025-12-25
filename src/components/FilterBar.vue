<template>
  <!-- Filter Tags -->
  <section class="filter-section">
    <div class="container">
      <div class="filter-tags">
        <el-radio-group
          :model-value="modelValue"
          @update:modelValue="$emit('update:modelValue', $event)"
        >
          <el-radio-button
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.id"
          >
            {{ cat.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: "FilterBar" });

defineProps({
  modelValue: {
    type: String,
    default: "all",
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["update:modelValue"]);
</script>
