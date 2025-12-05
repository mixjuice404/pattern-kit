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
            <button class="btn btn-sm btn-neutral">
                <icon name="hugeicons:plus-sign-square" size="16" />
                <span>Add Stitch</span>
            </button>
        </PageHeader>

        <div class="stitch-container">
            <div class="container-header">
                <div class="stitch-types">
                    <div v-for="type in stitchTypes" :key="type" class="stitch-type-item" :class="{'active': type === activeType}" @click="activeType = type">{{ type }}</div>
                </div>
                <div class="search-bar">
                    <div class="search-input">
                        <icon name="hugeicons:search-01" size="16" style="opacity: 0.5;" />
                        <input type="text" placeholder="Search stitches..." />
                    </div>
                    <div class="button-group">
                        <div class="filter-btn">
                            <icon name="hugeicons:sort-by-down-01" size="14" />
                            <div>Created ASC</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-4 2xl:grid-cols-5 gap-4">
                <div v-for="item in stitchItem" :key="item.alias" class="stitch-card">
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
                            <div class="item_abbrev">{{ abbrev.abbrev }}</div>
                        </div>
                    </div> 
                    <div class="card-actions">
                        <div class="card-action-item card-action__edit" @click="openEditModal(item)">
                            <icon name="hugeicons:edit-02" />
                            <div>Edit</div>
                        </div>
                        <div class="card-action-item card-action__delete">  
                            <icon name="hugeicons:delete-02" />
                            <div>Delete</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <LocalizationModal ref="localModalRef" @close="closeLocalModal" />

         <!-- localization modal -->
          <!-- <dialog id="local_modal" class="modal">
             <div class="modal-box custom-modal-box" style="max-width: 28rem;">
                <div class="modal-header">
                    <div>
                        <div class="modal-header__title">Manage Localization</div>
                        <div class="modal-header__subtitle">Manage multi-language standard for this stitch</div> 
                    </div>
                    <div class="modal-header__close-btn" @click="closeLocalModal">
                        <icon name="hugeicons:cancel-01" size="22" />
                    </div>
                </div>
                 <div class="modal-body">
                    <div class="stitch-standards" style="margin-bottom: 10px;">
                        <div class="stitch-standard-group">
                            <div class="stitch-standard-item">
                                <div class="stitch-standard-item__content">
                                    <div class="text-lg">🇺🇸</div>
                                    <div>US Terms</div>
                                </div>
                                <div style="padding-left: 10px;" class="flex items-center text-red-400 hover:text-red-500 cursor-pointer">
                                    <icon name="hugeicons:delete-02" size="16" />
                                </div>
                            </div>  
                            <div class="stitch-standard-item">
                                <div class="stitch-standard-item__content">
                                    <div class="text-lg">🇬🇧</div>
                                    <div>UK Terms</div>
                                </div>
                                <div style="padding-left: 10px;" class="flex items-center text-red-400 hover:text-red-500 cursor-pointer">
                                    <icon name="hugeicons:delete-02" size="16" />
                                </div>
                            </div>    
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; text-transform: uppercase; margin-bottom: 10px;" class="font-bold text-gray-500">Add New Standard</div>
                        <div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 10px; margin-bottom: 10px;">
                            <input type="text" placeholder="Flag e.g. 🇨🇳" class="input input-sm" />
                            <input type="text" placeholder="Language (e.g. Chinese)" class="input input-sm" />
                            <input type="text" placeholder="CODE(E.G. en)" class="input input-sm" />
                        </div>
                        <button type="submit" class="btn btn-sm btn-neutral w-full">Add Stitch Standard</button>
                    </div>
                 </div>
             </div>
          </dialog> -->



        <!-- edit modal -->
        <dialog id="edit_modal" class="modal">
            <div class="modal-box custom-modal-box" style="max-width: 56rem;">
                <div class="modal-header">
                    <div>
                        <div class="modal-header__title">Edit Stitch</div>
                        <div class="modal-header__subtitle">Manage definition and multi-language terminology</div> 
                    </div>
                    <div class="modal-header__close-btn" @click="closeEditModal">
                        <icon name="hugeicons:cancel-01" size="22" />
                    </div>
                </div>
                <div class="modal-body">
                    <div class="modal-form">
                        <div>
                            <div class="modal-form-card card__normal">
                                <div class="form-card-header">
                                    <div class="card__title">
                                        <icon name="hugeicons:information-square" size="16" />
                                        <div class="text-md font-bold">Basic Information</div>
                                    </div>
                                    <div class="autofill-btn">
                                        <icon name="hugeicons:ai-beautify" size="12" />
                                        <div>AI Autofill</div>
                                    </div>
                                </div>
                                <div>
                                    <div class="card-form mb-2">
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <div style="font-size: 12px; padding-left: 2px; margin-bottom: 5px;" class="font-semibold text-gray-500/90 uppercase">Stitch Name</div>
                                                <input id="stitch-name" type="text" placeholder="e.g. Single Crochet" class="input" />
                                            </div>
                                            <div>
                                                <div style="font-size: 12px; padding-left: 2px; margin-bottom: 5px;" class="font-semibold text-gray-500/90 uppercase">Category</div>
                                                <select id="stitch-category" class="select">
                                                    <option selected>Basic</option>
                                                    <option>Textured</option>
                                                    <option>Lace</option>
                                                    <option>Cable</option>
                                                    <option>Colorwork</option>
                                                    <option>Tunisian</option>
                                                    <option>Flower/Motif</option>
                                                </select>
                                            </div>
                                            <div class="col-span-2">
                                                <div style="font-size: 12px; padding-left: 2px; margin-bottom: 5px;" class="font-semibold text-gray-500/90 uppercase">Difficulty</div>
                                                <div class="grid grid-cols-4 gap-2">
                                                    <div class="stitch-level active">Beginner</div>
                                                    <div class="stitch-level">Intermediate</div>
                                                    <div class="stitch-level">Advanced</div>
                                                    <div class="stitch-level">Expert</div>
                                                </div>
                                            </div>
                                            <div class="col-span-2">
                                                <div style="font-size: 12px; padding-left: 2px; margin-bottom: 5px;" class="font-semibold text-gray-500/90 uppercase">Description</div>
                                                <textarea class="textarea w-full" placeholder="Brief description of the stitch ..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-form-card card__normal">
                                <div class="form-card-header">
                                    <div class="card__title">
                                        <icon name="hugeicons:information-square" size="16" />
                                        <div class="text-md font-bold">Detailed Instructions</div>
                                    </div>
                                </div>
                                <textarea class="textarea w-full" rows="5" placeholder="Detailed step-by-step instructions ..." />
                            </div>
                        </div>
                        
                        <div class="modal-form-card card__i18n">
                            <div class="stitch-alias">
                                <div class="i18n-icon"><icon name="hugeicons:globe-02" size="22" /></div>
                                <div>
                                    <div style="font-size: 14px;" class="font-bold">Terminology Matrix</div>
                                    <div style="font-size: 10px;" class="text-gray-500">
                                        Map terms across 3 configured standards
                                    </div>  
                                </div>
                            </div>
                            <div class="stitch-term-group" style="margin-bottom: 10px;">
                                <div class="stitch-term">
                                    <div class="flex items-center gap-2 justify-between">
                                        <div style="font-size: 12px;" class="font-bold text-gray-500/80">US Terms</div>
                                        <div style="font-size: 16px;">🇺🇸</div>
                                    </div>
                                    <div class="stitch-term-name text-neutral-900 ">Single Crochet (sc)</div>
                                    <div></div>
                                </div>
                                <div class="stitch-term">
                                    <div class="flex items-center gap-2 justify-between">
                                        <div style="font-size: 12px;" class="font-bold text-gray-500/80">UK Terms</div>
                                        <div style="font-size: 16px;">🇬🇧</div>
                                    </div>
                                    <div class="stitch-term-name text-neutral-900 ">Double Crochet (dc)</div>
                                    <div></div>
                                </div>
                                <div class="stitch-term">
                                    <div class="flex items-center gap-2 justify-between">
                                        <div style="font-size: 12px;" class="font-bold text-gray-500/80">Japanese</div>
                                        <div style="font-size: 16px;">🇯🇵</div>
                                    </div>
                                    <div class="stitch-term-name text-neutral-900 ">X (Coma)</div>
                                    <div></div>
                                </div>
                            </div>
                            <div class="stitch-term-tip">
                                <em>Tip: Use the AI Autofill button to attempt to find translations automatically. You can add more languages in the main settings.</em>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-neutral">
                        <icon name="hugeicons:cloud-upload" size="16" />
                        <span>Save Stitch</span>
                    </button>
                </div>
            </div>
        </dialog>

    </div>
</template>
<script setup lang="ts">
import LocalizationModal from '~/components/modal/stitch/localization/index.vue'

// default values
const breadcrumbs = [
  { label: "Home", to: "/", icon: "solar:home-2-outline" },
  { label: "Dictionary", icon: "solar:emoji-funny-circle-outline" },
  { label: "Stitch" },
];

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


const stitchItem = [
    {
        category: "Basic",
        title: "Single Crochet",
        alias: "sc",
        level: "beginner",
        description: "The most fundamental stitch in crochet, creating a dense, tight fabric.",
        abbrev: [
            { flag: "🇺🇸", lang: "US", abbrev: "Single Crochet (sc)" },
            { flag: "🇬🇧", lang: "UK", abbrev: "Double Crochet (dc)" },
            { flag: "🇯🇵", lang: "JP", abbrev: "X (Coma)" },
        ],
    }, {
        category: "Textured",
        title: "Popcorn Stitch",
        alias: "ps",
        level: "intermediate",
        description: "A decorative stitch that pops out from the fabric, creating a 3D effect.",
        abbrev: [
            { flag: "🇺🇸", lang: "US", abbrev: "Popcorn" },
            { flag: "🇬🇧", lang: "UK", abbrev: "Popcorn" },
            { flag: "🇯🇵", lang: "JP", abbrev: "Pineapple shape" },
        ],
    },
]


// edit modal function
const closeEditModal = () => {
    const modal = document.getElementById('edit_modal') as HTMLDialogElement
    modal.close()
}

const openEditModal = (item: any) => {
    item.active = true
    const modal = document.getElementById('edit_modal') as HTMLDialogElement
    modal.showModal()
}

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
            padding-right: 4px;
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
            font-size: 14px;
            height: 68px;
            
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
            display: flex;
            gap: 5px;
            font-size: 12px;
            font-weight: 500;
            justify-content: flex-end;

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

                &:last-child {
                    border-bottom: none;
                }

                .item_lang {
                    font-weight: bold;
                    color: var(--color-gray-400);
                }
                .item_abbrev {
                    color: var(--color-gray-700);
                    font-weight: 500;
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

// modal styles
.modal-form {
    display: grid; 
    grid-template-columns: 61% auto; 
    gap: 20px;
    align-items: start;

    .modal-form-card {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 20px;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.02);

        .form-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;

            .card__title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 700;
            }

            .autofill-btn {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 8px 14px;
                border-radius: 100px;
                line-height: 1;
                font-weight: 500;
                font-size: 12px;
                background-color: var(--color-violet-50);
                color: var(--color-violet-500);
            }
        }
    }

    .card__normal {
        background-color: white;
        border: 0.5px solid var(--color-gray-200);
    }

    .card__i18n {
        border: 0.5px solid var(--color-indigo-200);
        background-color: oklch(96.2% 0.018 272.314 / 0.5);

        .stitch-alias {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            
            .i18n-icon {
                height: 36px;
                width: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--color-indigo-200);
                border-radius: 6px;
                color: var(--color-indigo-500);
            }
        }

        .stitch-term-tip {
            font-size: 10px;
            padding: 10px;
            border-radius: 6px;
            line-height: 1.2;
            opacity: 0.8;
            background-color: var(--color-gray-50);
            border: 0.5px solid var(--color-gray-200);
            color: var(--color-gray-500);
        }

        .stitch-term-group {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .stitch-term {
                background-color: white;
                padding: 10px 16px;
                border-radius: 6px;
                border: 0.5px solid var(--color-indigo-100);

                &:hover {
                    border: 0.5px solid var(--color-indigo-300);
                }

                .stitch-term-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--color-neutral-900);
                }
            }

            
        }
    }

    .stitch-level {
        font-size: 12px;
        padding: 10px 0;
        border-radius: 6px;
        line-height: 1;
        border: 1px solid var(--color-gray-200);
        color: var(--color-gray-500);
        text-align: center;
        font-weight: 500;
        cursor: pointer;

        &.active {
            background-color: var(--color-neutral);
            border-color: var(--color-neutral);
            color: white;
        }
    }
}
</style>
