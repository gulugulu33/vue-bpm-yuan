<template>
  <div
    class="virtual-list-container"
    :style="{ height: `${containerHeight}px` }"
    @scroll="handleScroll"
  >
    <div
      class="virtual-list-content"
      :style="{ height: `${totalHeight}px`, transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="(item, index) in visibleData"
        :key="getItemKey(item as any, startIndex + index)"
        class="virtual-list-item"
        :style="{ height: `${itemHeight}px` }"
      >
        <slot :item="item" :index="startIndex + index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, watch } from 'vue';
import { useVirtualList } from '../hooks/useVirtualList';

interface Props {
  list: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  itemKey?: (item: T) => string | number;
}

const props = withDefaults(defineProps<Props>(), {
  overscan: 5,
  itemKey: (item: any) => item.id,
});

const emit = defineEmits<{
  scroll: [event: Event];
}>();

const listRef = ref(props.list);

watch(() => props.list, (newList) => {
  listRef.value = newList;
});

const {
  visibleData,
  totalHeight,
  offsetY,
  startIndex,
  handleScroll: onScroll,
} = useVirtualList({
  list: listRef,
  itemHeight: props.itemHeight,
  containerHeight: props.containerHeight,
  overscan: props.overscan,
});

function handleScroll(event: Event) {
  onScroll(event);
  emit('scroll', event);
}

function getItemKey(item: T, index: number): string | number {
  return props.itemKey ? props.itemKey(item) : index;
}
</script>

<style scoped>
.virtual-list-container {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

.virtual-list-item {
  position: relative;
  box-sizing: border-box;
}
</style>
