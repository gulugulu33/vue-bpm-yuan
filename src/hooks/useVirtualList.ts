import { ref, computed, onMounted, type Ref } from 'vue';

export interface VirtualListOptions<T> {
  list: Ref<T[]>;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export interface VirtualListResult<T> {
  visibleData: Ref<T[]>;
  totalHeight: Ref<number>;
  offsetY: Ref<number>;
  startIndex: Ref<number>;
  endIndex: Ref<number>;
  handleScroll: (event: Event) => void;
}

export function useVirtualList<T>(options: VirtualListOptions<T>): VirtualListResult<T> {
  const { list, itemHeight, containerHeight, overscan = 5 } = options;

  const scrollTop = ref(0);
  const startIndex = ref(0);
  const endIndex = ref(0);
  const offsetY = ref(0);

  const totalHeight = computed(() => list.value.length * itemHeight);

  const updateVisibleRange = () => {
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan);
    const end = Math.min(
      list.value.length,
      Math.ceil((scrollTop.value + containerHeight) / itemHeight) + overscan
    );

    startIndex.value = start;
    endIndex.value = end;
    offsetY.value = start * itemHeight;
  };

  const visibleData = computed(() => {
    return list.value.slice(startIndex.value, endIndex.value);
  });

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
    updateVisibleRange();
  };

  onMounted(() => {
    updateVisibleRange();
  });

  return {
    visibleData,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll,
  };
}
