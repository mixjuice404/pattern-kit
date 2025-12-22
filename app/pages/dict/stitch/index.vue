<template>
    <div class="default-container">
        <PageHeader title="Stitch Dictionary" :breadcrumbs="breadcrumbs">
            <!-- <button class="btn btn-sm btn-primary">
                <icon name="hugeicons:file-import" size="16" />
                <span>Import</span>
            </button> -->
            <button class="btn btn-sm btn-primary" @click="openLocalModal()">
                <icon name="hugeicons:global" size="16" />
                <span>Localization</span>
            </button>
            <button class="btn btn-sm btn-neutral" @click="openCreateModal">
                <icon name="hugeicons:plus-sign-square" size="16" />
                <span>Add Stitch</span>
            </button>
        </PageHeader>

        <div class="stitch-container">
            <div class="container-header">
                <div class="stitch-types">
                    <div v-for="type in stitchTypes" :key="type" class="stitch-type-item" :class="{'active': type === activeType}" @click="setActiveType(type)">{{ type }}</div>
                </div>
                <div class="search-bar">
                    <div class="search-input">
                        <icon name="hugeicons:search-01" size="16" style="opacity: 0.5;" />
                        <input
                            v-model.trim="keyword"
                            type="text"
                            placeholder="Search stitches..."
                            @keyup.enter="search"
                        />
                    </div>
                    <div class="button-group">
                        <kbd class="kbd kbd-sm">Enter ↵</kbd>
                    </div>
                </div>
            </div>
            <div v-if="stitchItem.length" class="grid grid-cols-4 2xl:grid-cols-5 gap-4">
                <div v-for="item in stitchItem" :key="item.id" class="stitch-card">
                    <div class="stitch-info">
                        <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                            <div class="stitch-tag stitch-tag-beginner" v-if="item.level === 'beginner'">Beginner</div>
                            <div class="stitch-tag stitch-tag-intermediate" v-else-if="item.level === 'intermediate'">Intermediate</div>
                            <div class="stitch-tag stitch-tag-advanced" v-else>Advanced</div>
                            <div class="stitch-category">{{ item.category }}</div>
                        </div>
                        <div class="stitch-title">{{ item.title }}</div>
                    </div>
                    <div class="stitch-description">{{ item.description }}</div>
                    <div class="stitch-abbrev-list">
                        <div v-for="abbrev in item.abbrev" :key="abbrev.flag" class="stitch-abbrev-item"> 
                            <div class="item_lang">{{ abbrev.flag + " " + abbrev.lang }}</div>
                            <div class="tooltip" :data-tip="abbrev.name">
                                <div class="item_abbrev">
                                    {{ abbrev.abbrev }}
                                </div>
                            </div>
                        </div>
                    </div> 
                    <div class="card-actions">
                        <div class="card-action-item card-action__edit" @click="openEditModal(item)">
                            <icon name="hugeicons:edit-02" />
                            <div>Edit</div>
                        </div>
                        <div
                            class="card-action-item card-action__delete"
                            :class="{ 'opacity-50 pointer-events-none': deletingIds.has(item.id) }"
                            @click.stop="removeItem(item.id)"
                        >  
                            <icon name="hugeicons:delete-02" />
                            <div>Delete</div>
                        </div>
                    </div>
                </div>
            </div>
            <Empty v-else-if="!loading" notice="No stitches found." text="Try adjusting filters or add a new stitch." />
            <div v-else class="text-sm opacity-70">Loading...</div>

            <Pagination
                v-if="!loading && total > 0"
                :total="total"
                :page="page"
                :total-pages="totalPages"
                class="mt-6"
                @change="changePage"
            />
        </div>


        <LocalizationModal ref="localModalRef" @close="closeLocalModal" />
        <EditStitchModal ref="editModalRef" @save="handleSaveStitch" />

    </div>
</template>
<script setup lang="ts">
// =============================================================================
// Stitch Dictionary Page
// - List/search/filter/pagination
// - Create/Edit stitch (with localizations)
// - Delete stitch
// =============================================================================

// Imports
import Empty from "@/components/common/empty/index.vue";
import Pagination from "@/components/common/pagination/index.vue";
import type { ApiResponse } from "~/types/ApiResponse";
import { useAppToast } from "~/composables/useAppToast";
import LocalizationModal from '~/components/modal/stitch/localization/index.vue'
import EditStitchModal from '~/components/modal/stitch/edit/index.vue'

// UI refs / notifications
const editModalRef = ref<any>(null) as any
const toast = useAppToast()

// Request guards
const saving = ref(false)
const deletingIds = ref<Set<number>>(new Set())

// Page header
const breadcrumbs = [
  { label: "Home", to: "/", icon: "solar:home-2-outline" },
  { label: "Dictionary", icon: "solar:emoji-funny-circle-outline" },
  { label: "Stitch" },
];

// Filters
const stitchTypes = [
    "All",
    "Basic",
    "Textured",
    "Lace",
    "Cable",
    "Colorwork",
    "Tunisian",
    "Flower/Motif",
]
const activeType = ref("All");

// API DTOs / View models
type StitchLocalizationDto = {
    languageCode: string;
    flag: string;
    name: string | null;
    abbrev: string | null;
    description: string | null;
};

type StitchDto = {
    id: number;
    defaultName: string;
    description: string | null;
    type: string;
    level: string;
    localizations: StitchLocalizationDto[];
};

type StitchPageResult = {
    list: StitchDto[];
    total: number;
    page: number;
    pageSize: number;
};

type StitchUpsertPayload = {
    id: number | null;
    defaultName: string;
    description: string;
    type: string;
    level: string;
    localizations?: Array<{
        languageCode: string;
        flag: string;
        name: string;
        abbrev: string;
        description: string;
    }>;
};

type StitchCard = {
    id: number;
    category: string;
    title: string;
    alias: string;
    level: string;
    description: string | null;
    abbrev: Array<{ flag: string; lang: string; abbrev: string, name: string }>;
};

// List state
const stitchItem = ref<StitchCard[]>([]);
const loading = ref(false);

// Search & pagination
const keyword = ref("");
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

// Derived
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

// Mapping: API DTO -> card view
const toCard = (s: StitchDto): StitchCard => {
    const us = s.localizations.find(l => (l.languageCode ?? '').toUpperCase() === 'US');
    const title = (us?.name ?? s.defaultName).trim();
    const alias = (us?.abbrev ?? '').trim() || String(s.id);

    const abbrev = s.localizations
        .map(l => {
            const name = (l.name ?? '').trim();
            const ab = (l.abbrev ?? '').trim();
            // const text = ab ? `${name || l.languageCode} (${ab})` : name;
            return {
                flag: l.flag,
                lang: l.languageCode,
                abbrev: ab?.trim(),
                name: name?.trim(),
            };
        })
        .filter(x => x.abbrev);

    return {
        id: s.id,
        category: s.type,
        title,
        alias,
        level: s.level,
        description: s.description ?? null,
        abbrev: abbrev,
    };
};

// Data loading
const load = async () => {
    loading.value = true;
    try {
        const params = new URLSearchParams({
            page: String(page.value),
            pageSize: String(pageSize.value),
        });
        if (keyword.value) params.set("keyword", keyword.value);
        if (activeType.value && activeType.value !== "All") params.set("type", activeType.value);

        const res = await $fetch<ApiResponse<{ result: StitchPageResult }>>(
            `/api/dict/stitch/list?${params.toString()}`,
            { method: 'GET' }
        );

        const result = res?.data?.result;
        stitchItem.value = Array.isArray(result?.list) ? result.list.map(toCard) : [];
        total.value = Number(result?.total) || 0;
        page.value = Number(result?.page) || page.value;
        pageSize.value = Number(result?.pageSize) || pageSize.value;
    } catch (e) {
        stitchItem.value = [];
        total.value = 0;
        throw e;
    } finally {
        loading.value = false;
    }
};

// List interactions
const search = async () => {
    page.value = 1;
    await load();
};

const setActiveType = async (type: string) => {
    if (type === activeType.value) return;
    activeType.value = type;
    page.value = 1;
    await load();
};

const changePage = async (p: number) => {
    if (p === page.value || p < 1 || p > totalPages.value) return;
    page.value = p;
    await load();
};

// Lifecycle
onMounted(load);

// Create / Edit
const openEditModal = async (item: any) => {
    const id = Number(item?.id)
    if (!id || Number.isNaN(id)) return
    try {
        const res = await $fetch<ApiResponse<{ result: StitchDto }>>(`/api/dict/stitch/${id}`, {
            method: 'GET'
        })
        const detail = res?.data?.result
        if (!res?.success || !detail) {
            throw new Error(res?.message || 'Failed to fetch stitch detail')
        }
        editModalRef.value?.setStitch(detail)
        editModalRef.value?.open()
    } catch (e: any) {
        toast.error(e?.message || 'Failed to fetch stitch detail')
    }
}

const openCreateModal = () => {
    editModalRef.value?.setStitch({
        id: null,
        defaultName: '',
        description: '',
        type: 'Basic',
        level: 'beginner',
    })
    editModalRef.value?.open()
}

const handleSaveStitch = async (payload: StitchUpsertPayload) => {
    if (saving.value) return
    const name = (payload?.defaultName ?? '').trim()
    if (!name) {
        toast.error('Stitch name is required')
        return
    }

    saving.value = true
    try {
        const desc = (payload?.description ?? '').trim()
        const body = {
            id: payload?.id ?? null,
            defaultName: name,
            type: payload?.type ?? 'Basic',
            level: payload?.level ?? 'beginner',
            description: desc ? desc : null,
            localizations: Array.isArray(payload?.localizations) ? payload.localizations : undefined,
        }
        const res = await $fetch<ApiResponse<{ result: number }>>('/api/dict/stitch', {
            method: 'POST',
            body,
        })
        if (!res?.success) {
            throw new Error(res?.message || 'Save failed')
        }
        toast.success('Stitch saved successfully!')
        editModalRef.value?.close()
        await load()
    } catch (e: any) {
        toast.error(e?.message || 'Save failed')
    } finally {
        saving.value = false
    }
}

// Delete
const removeItem = async (id: number) => {
    if (!id || deletingIds.value.has(id)) return
    const ok = confirm('确定删除该 Stitch 吗？此操作不可撤销。')
    if (!ok) return

    deletingIds.value.add(id)
    try {
        const res = await $fetch<ApiResponse<{ result: number }>>(`/api/dict/stitch/${id}`, {
            method: 'DELETE',
        })
        if (!res?.success) {
            throw new Error(res?.message || 'Delete failed')
        }
        toast.success('Stitch deleted successfully!')
        await load()
        if (page.value > 1 && stitchItem.value.length === 0) {
            page.value = page.value - 1
            await load()
        }
    } catch (e: any) {
        toast.error(e?.message || 'Delete failed')
    } finally {
        deletingIds.value.delete(id)
    }
}

// Localization settings modal
const closeLocalModal = () => {
    const modal = document.getElementById('local_modal') as HTMLDialogElement
    modal.close()
}

const openLocalModal = () => {
    const modal = document.getElementById('local_modal') as HTMLDialogElement
    modal.showModal()
}



</script>
<style scoped lang="scss">
@use "sass:map"; 

.stitch-container {

    .container-header {
        margin-bottom: 35px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        // Search bar
        .search-bar {
            font-size: 14px;
            display: flex;
            align-items: center;
            padding: 0 10px;
        
            background-color: white;
            border-radius: 8px;
            border: 1px solid var(--color-gray-200);
            height: 38px;
            gap: 8px;
            
            .search-input {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 8px;
                background-color: white;
                border-radius: 8px 0 0 8px;
                input {
                    width: 210px;
                    border: none;
                    outline: none;
                }
            }

            .button-group {
                display: flex;
                gap: 4px;

                .filter-btn {
                    font-size: 10px;
                    font-weight: 600;
                    height: 100%;
                    cursor: pointer;
                    color: var(--color-gray-600);
                    background-color: var(--color-gray-100);
                    transition: all 0.2s ease-in-out;
                    height: 28px;
                    padding: 0 8px;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    text-transform: uppercase;

                    &:hover {
                        background-color: var(--color-gray-700);
                        color: white;
                    }
                }
            }
        }

        .stitch-types {
            display: flex;
            gap: 10px;
            align-items: center;

            .stitch-type-item {
                padding: 4px 12px;
                border-radius: 100px;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.2;
                cursor: pointer;
                transition: all 0.2s ease-in-out;

                border: 1px solid var(--color-gray-200);
                background-color: var(--color-gray-100);

                &:hover {
                    background-color: var(--color-gray-200);
                }

                &.active {
                    background-color: var(--color-violet-50);
                    color: var(--color-violet-600);
                    border: 1px solid var(--color-violet-400);
                }
            }
        }
    }

    .stitch-card {
        background-color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 0 10px 0 oklch(92.8% 0.006 264.531 / 0.2);
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        display: flex;
        flex-direction: column;

        &:hover {
            box-shadow: var(--shadow-md);
        }

        .stitch-category {
            font-size: 10px;
            text-transform: uppercase;
            color: var(--color-gray-400);
            font-weight: 700;
        }

        .stitch-info {
            margin-bottom: 15px;

            .stitch-title {
                font-size: 16px;
                font-weight: bold;
            }
        }

        .stitch-description {
            font-size: 12px;
            height: 62px;
            
            
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            line-clamp: 3;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            color: var(--color-gray-500);
            margin-bottom: 20px;
        }

        .card-actions {
            flex-grow: 1;
            display: flex;
            gap: 5px;
            font-size: 12px;
            font-weight: 500;
            justify-content: flex-end;
            align-items: end;

            .card-action-item {
                display: flex;
                align-items: center;
                gap: 4px;
                line-height: 1.4;
                padding: 6px 10px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease-in-out;
            }

            .card-action__edit {
                background-color: var(--color-violet-50);
                color: var(--color-violet-600);
                 &:hover {
                    background-color: var(--color-violet-100);
                }
            }

            .card-action__delete {
                &:hover {
                    background-color: var(--color-rose-50);
                    color: var(--color-rose-600);
                } 
            }
        }

        .stitch-abbrev-list {
            font-size: 12px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            background-color: var(--color-gray-50);
            line-height: 1.2;
            padding: 5px 10px;
            border-radius: 6px;
            margin-bottom: 10px;


            .stitch-abbrev-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-top: 4px;
                padding-bottom: 7px;
                border-bottom: 0.5px dashed var(--color-gray-200);
                gap: 15px;

                &:last-child {
                    border-bottom: none;
                }

                .item_lang {
                    flex-shrink: 0;
                    font-weight: bold;
                    color: var(--color-gray-400);
                }
                .item_abbrev {
                    color: var(--color-gray-700);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
}

.stitch-tag {
    display: inline-block;
    font-size: 10px;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 100px;
    line-height: 1;
    font-weight: 600;

    $difficulty-colors: (
        'beginner': (
            'bg': var(--color-emerald-100),
            'border': var(--color-emerald-200),
            'text': var(--color-emerald-700)
        ),
        'intermediate': (
            'bg': var(--color-yellow-100),
            'border': var(--color-yellow-200),
            'text': var(--color-yellow-700)
        ),
        'advanced': (
            'bg': var(--color-orange-100),
            'border': var(--color-orange-200),
            'text': var(--color-orange-700)
        ),
        'expert': (
            'bg': var(--color-rose-100),
            'border': var(--color-rose-200),
            'text': var(--color-rose-700)
        )
    );

    @each $level, $colors in $difficulty-colors {
        &-#{$level} {
            background-color: map.get($colors, 'bg');
            border: 1px solid map.get($colors, 'border');
            color: map.get($colors, 'text');
        }
    }
}

</style>
