<template>
  <div class="character-management">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>캐릭터 관리</h2>
        <p class="subtitle">사용자가 대화할 수 있는 AI 캐릭터를 관리합니다</p>
      </div>
      <button @click="showCreateModal = true" class="create-btn">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        새 캐릭터 추가
      </button>
    </div>

    <!-- Filter and Search Bar -->
    <div class="controls-bar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="캐릭터 검색..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
      <div class="filter-group">
        <button
          @click="filterStatus = 'all'; handleFilterChange()"
          :class="['filter-btn', { active: filterStatus === 'all' }]"
        >
          전체
        </button>
        <button
          @click="filterStatus = 'active'; handleFilterChange()"
          :class="['filter-btn', { active: filterStatus === 'active' }]"
        >
          활성
        </button>
        <button
          @click="filterStatus = 'inactive'; handleFilterChange()"
          :class="['filter-btn', { active: filterStatus === 'inactive' }]"
        >
          비활성
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>캐릭터 목록을 불러오는 중...</p>
    </div>

    <!-- Character Grid -->
    <div v-else-if="filteredCharacters.length > 0" class="characters-grid">
      <div v-for="character in filteredCharacters" :key="character.character_id" class="character-card">
        <!-- Character Header with Avatar -->
        <div class="card-header">
          <div class="avatar-section">
            <div class="avatar" :class="`gender-${character.gender}`">
              <img 
                v-if="getAvatarUrl(character.avatar_url)" 
                :src="getAvatarUrl(character.avatar_url)!" 
                :alt="character.name" 
                @error="handleAvatarError"
              />
              <div v-else class="avatar-placeholder">
                <svg v-if="character.gender === 'male'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/>
                  <path d="M10 14v8m0 0l-3-3m3 3l3-3"/>
                  <path d="M15 9V3h6m0 0-3 3m3-3-3 3"/>
                </svg>
                <svg v-else-if="character.gender === 'female'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="M12 13v8m0 0h-3m3 0h3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 17v4"/>
                </svg>
              </div>
              <div class="gender-badge">
                <svg v-if="character.gender === 'male'" viewBox="0 0 24 24" fill="currentColor" class="gender-icon">
                  <path d="M15.05 7.05L12.22 9.88C13.3 11.03 13.3 12.88 12.21 14.03C11.1 15.18 9.18 15.18 8.04 14.03C6.91 12.88 6.91 10.97 8.04 9.82C9.17 8.68 11.09 8.68 12.23 9.82L15.05 7L15.76 7.71L16.47 7L19.29 9.82L18.58 10.53L17.87 11.24L17.16 10.53L15.76 9.13L13.64 11.25C14.52 12.61 14.52 14.44 13.64 15.8C12.52 17.5 10.33 17.97 8.63 17.09C6.94 16.22 6.46 14.03 7.34 12.33C8.22 10.63 10.41 10.16 12.11 11.04L13.52 9.63L15.05 8.1V7.05Z"/>
                  <path d="M15.05 4.05H21.05V10.05"/>
                </svg>
                <svg v-else-if="character.gender === 'female'" viewBox="0 0 24 24" fill="currentColor" class="gender-icon">
                  <circle cx="12" cy="9" r="4"/>
                  <path d="M12 13v4m-2 0h4m-2 0v4"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor" class="gender-icon">
                  <path d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9A2.5 2.5 0 0 1 12 11.5M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z"/>
                </svg>
              </div>
            </div>
            <div class="status-indicator" :class="character.is_active ? 'active' : 'inactive'"></div>
          </div>
          <div class="character-info">
            <h3>{{ character.name }}</h3>
            <p class="character-intro">{{ character.intro }}</p>
          </div>
        </div>

        <!-- Tags Section -->
        <div class="tags-container">
          <div class="tag-group">
            <div class="tag-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span>성격</span>
            </div>
            <div class="tags">
              <span v-for="tag in character.personality_tags" :key="`p-${tag}`" class="tag personality">
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="tag-group">
            <div class="tag-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>관심사</span>
            </div>
            <div class="tags">
              <span v-for="tag in character.interest_tags" :key="`i-${tag}`" class="tag interest">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Prompt Preview -->
        <div class="prompt-section">
          <div class="prompt-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>프롬프트</span>
          </div>
          <p class="prompt-preview">{{ character.prompt }}</p>
        </div>

        <!-- Card Footer with Actions and Stats -->
        <div class="card-footer">
          <div class="stats">
            <div class="stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{{ character.chat_count || 0 }} 대화</span>
            </div>
            <div class="stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <span>{{ character.unique_users || 0 }} 사용자</span>
            </div>
          </div>
          <div class="actions">
            <button @click="viewCharacter(character)" class="action-btn view" title="상세보기">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button @click="editCharacter(character)" class="action-btn edit" title="수정">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button @click="manageAvatar(character)" class="action-btn avatar" title="아바타 관리">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            <button @click="toggleActive(character)" class="action-btn toggle" :title="character.is_active ? '비활성화' : '활성화'">
              <svg v-if="character.is_active" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="13" width="14" height="1" rx="0.5" transform="rotate(-45 12 12)"/>
                <rect x="12" y="6" width="1" height="14" rx="0.5" transform="rotate(-45 12 12)"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            <button @click="confirmDelete(character)" class="action-btn delete" title="삭제">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && !loading" class="pagination">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <div class="pagination-info">
        페이지 {{ currentPage }} / {{ totalPages }}
      </div>
      
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="characters.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
        </svg>
      </div>
      <h3>캐릭터가 없습니다</h3>
      <p>새로운 캐릭터를 추가하여 사용자들이 대화할 수 있도록 하세요</p>
      <div class="empty-actions">
        <button @click="showCreateModal = true" class="primary-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          새 캐릭터 추가
        </button>
        <button @click="createDefaultCharacters" class="secondary-btn" :disabled="creatingDefaults">
          <svg v-if="!creatingDefaults" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <div v-else class="spinner-small"></div>
          {{ creatingDefaults ? '생성 중...' : '기본 캐릭터 생성' }}
        </button>
      </div>
    </div>

    <!-- Character Modal (Create/Edit) -->
    <Teleport to="body">
      <div v-if="showCreateModal || editingCharacter" class="modal-overlay" @click="closeModal">
        <div class="modal large" @click.stop>
          <div class="modal-header">
            <h3>{{ editingCharacter ? '캐릭터 수정' : '새 캐릭터 추가' }}</h3>
            <button @click="closeModal" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label for="name">캐릭터 이름 *</label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  class="form-input"
                  placeholder="예: 친절한 도우미"
                  required
                  maxlength="50"
                />
              </div>

              <div class="form-group">
                <label for="gender">성별 *</label>
                <select
                  id="gender"
                  v-model="formData.gender"
                  class="form-input"
                  required
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="intro">캐릭터 소개 *</label>
              <textarea
                id="intro"
                v-model="formData.intro"
                class="form-textarea"
                placeholder="캐릭터를 간단히 소개해주세요..."
                rows="2"
                required
                maxlength="200"
              ></textarea>
              <small class="char-count">{{ formData.intro.length }} / 200</small>
            </div>

            <div class="form-group">
              <label>성격 태그 *</label>
              <div class="tag-input-container">
                <div class="tags-display">
                  <span
                    v-for="(tag, index) in formData.personality_tags"
                    :key="`personality-${index}`"
                    class="tag editable"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      @click="removeTag('personality', index)"
                      class="tag-remove"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                  <input
                    v-model="personalityTagInput"
                    @keydown.enter.prevent="addTag('personality')"
                    type="text"
                    class="tag-input"
                    placeholder="태그 입력 후 Enter"
                  />
                </div>
                <small class="help-text">캐릭터의 성격 특성을 태그로 추가하세요</small>
              </div>
            </div>

            <div class="form-group">
              <label>관심사 태그 *</label>
              <div class="tag-input-container">
                <div class="tags-display">
                  <span
                    v-for="(tag, index) in formData.interest_tags"
                    :key="`interest-${index}`"
                    class="tag editable"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      @click="removeTag('interest', index)"
                      class="tag-remove"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                  <input
                    v-model="interestTagInput"
                    @keydown.enter.prevent="addTag('interest')"
                    type="text"
                    class="tag-input"
                    placeholder="태그 입력 후 Enter"
                  />
                </div>
                <small class="help-text">캐릭터가 관심있어 하는 주제를 태그로 추가하세요</small>
              </div>
            </div>

            <div class="form-group">
              <label for="prompt">시스템 프롬프트 *</label>
              <textarea
                id="prompt"
                v-model="formData.prompt"
                class="form-textarea"
                placeholder="이 캐릭터의 성격, 역할, 행동 방식을 상세히 정의하세요..."
                rows="6"
                required
                maxlength="2000"
              ></textarea>
              <small class="char-count">{{ formData.prompt.length }} / 2000</small>
            </div>

            <div class="modal-footer">
              <button type="button" @click="closeModal" class="btn secondary">
                취소
              </button>
              <button type="submit" class="btn primary" :disabled="!isFormValid">
                {{ editingCharacter ? '수정' : '추가' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- View Character Modal -->
    <Teleport to="body">
      <div v-if="viewingCharacter" class="modal-overlay" @click="viewingCharacter = null">
        <div class="modal large" @click.stop>
          <div class="modal-header">
            <h3>캐릭터 상세 정보</h3>
            <button @click="viewingCharacter = null" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body" v-if="viewingCharacter">
            <div class="character-detail">
              <div class="detail-header">
                <div class="avatar large" :class="`gender-${viewingCharacter.gender}`">
                  <img 
                    v-if="getAvatarUrl(viewingCharacter.avatar_url)" 
                    :src="getAvatarUrl(viewingCharacter.avatar_url)!" 
                    :alt="viewingCharacter.name" 
                    @error="handleAvatarError"
                  />
                  <div v-else class="avatar-placeholder">
                    <svg v-if="viewingCharacter.gender === 'male'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/>
                      <path d="M10 14v8m0 0l-3-3m3 3l3-3"/>
                      <path d="M15 9V3h6m0 0-3 3m3-3-3 3"/>
                    </svg>
                    <svg v-else-if="viewingCharacter.gender === 'female'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="8" r="5"/>
                      <path d="M12 13v8m0 0h-3m3 0h3"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="5"/>
                      <path d="M12 17v4"/>
                    </svg>
                  </div>
                </div>
                <div class="detail-info">
                  <h2>{{ viewingCharacter.name }}</h2>
                  <p class="subtitle">{{ viewingCharacter.intro }}</p>
                  <div class="meta-info">
                    <span class="meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      생성일: {{ formatDate(viewingCharacter.created_at) }}
                    </span>
                    <span class="meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      최종 수정: {{ formatDate(viewingCharacter.updated_at) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>성격 특성</h4>
                <div class="tags">
                  <span v-for="tag in viewingCharacter.personality_tags" :key="`vp-${tag}`" class="tag personality large">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <div class="detail-section">
                <h4>관심 분야</h4>
                <div class="tags">
                  <span v-for="tag in viewingCharacter.interest_tags" :key="`vi-${tag}`" class="tag interest large">
                    {{ tag }}
                  </span>
                </div>
              </div>

              <div class="detail-section">
                <h4>시스템 프롬프트</h4>
                <div class="prompt-box">
                  {{ viewingCharacter.prompt }}
                </div>
              </div>

              <div class="detail-section">
                <h4>사용 통계</h4>
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ viewingCharacter.chat_count || 0 }}</div>
                      <div class="stat-label">총 대화 수</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ viewingCharacter.unique_users || 0 }}</div>
                      <div class="stat-label">사용자 수</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </div>
                    <div class="stat-content">
                      <div class="stat-value">{{ formatNumber(viewingCharacter.total_tokens || 0) }}</div>
                      <div class="stat-label">토큰 사용량</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="characterToDelete" class="modal-overlay" @click="characterToDelete = null">
        <div class="modal confirm" @click.stop>
          <div class="modal-header">
            <h3>캐릭터 삭제</h3>
          </div>
          <div class="modal-body">
            <div class="warning-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="confirm-message">
              정말로 <strong>{{ characterToDelete.name }}</strong> 캐릭터를 삭제하시겠습니까?
            </p>
            <p class="warning-message" v-if="characterToDelete.chat_count && characterToDelete.chat_count > 0">
              이 캐릭터는 {{ characterToDelete.chat_count }}개의 대화에서 사용되었습니다.
              삭제하면 모든 대화 기록도 함께 삭제됩니다.
            </p>
          </div>
          <div class="modal-footer">
            <button @click="characterToDelete = null" class="btn secondary">
              취소
            </button>
            <button @click="deleteCharacter" class="btn danger">
              삭제
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Avatar Management Modal -->
    <Teleport to="body">
      <div v-if="managingAvatarCharacter" class="modal-overlay" @click="managingAvatarCharacter = null">
        <div class="modal confirm" @click.stop>
          <div class="modal-header">
            <h3>{{ managingAvatarCharacter.name }} 아바타 관리</h3>
            <button @click="managingAvatarCharacter = null" class="close-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="avatar-management">
              <!-- Current Avatar Display -->
              <div class="current-avatar">
                <div class="avatar large" :class="`gender-${managingAvatarCharacter.gender}`">
                  <img 
                    v-if="getAvatarUrl(managingAvatarCharacter.avatar_url)" 
                    :src="getAvatarUrl(managingAvatarCharacter.avatar_url)!" 
                    :alt="managingAvatarCharacter.name" 
                    @error="handleAvatarError"
                  />
                  <div v-else class="avatar-placeholder">
                    <svg v-if="managingAvatarCharacter.gender === 'male'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/>
                      <path d="M10 14v8m0 0l-3-3m3 3l3-3"/>
                      <path d="M15 9V3h6m0 0-3 3m3-3-3 3"/>
                    </svg>
                    <svg v-else-if="managingAvatarCharacter.gender === 'female'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="8" r="5"/>
                      <path d="M12 13v8m0 0h-3m3 0h3"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="5"/>
                      <path d="M12 17v4"/>
                    </svg>
                  </div>
                </div>
                <p class="avatar-status">
                  {{ managingAvatarCharacter.avatar_url ? '아바타 이미지 설정됨' : '기본 아바타 사용 중' }}
                </p>
              </div>

              <!-- File Upload Section -->
              <div class="upload-section">
                <input
                  ref="avatarFileInput"
                  type="file"
                  accept="image/*"
                  @change="handleAvatarFileSelect"
                  class="file-input"
                  style="display: none"
                />
                
                <!-- Preview Section (when file is selected) -->
                <div v-if="avatarPreview" class="preview-section">
                  <div class="preview-container">
                    <img :src="avatarPreview" alt="Preview" class="preview-image" />
                  </div>
                  <p class="preview-text">새 아바타 미리보기</p>
                </div>

                <!-- Upload Actions -->
                <div class="upload-actions">
                  <button @click="triggerFileInput" class="btn secondary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    {{ selectedAvatarFile ? '다른 파일 선택' : '파일 선택' }}
                  </button>
                  
                  <button 
                    v-if="selectedAvatarFile" 
                    @click="uploadAvatar" 
                    :disabled="uploadingAvatar"
                    class="btn primary"
                  >
                    <div v-if="uploadingAvatar" class="spinner-small"></div>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {{ uploadingAvatar ? '업로드 중...' : '아바타 업로드' }}
                  </button>
                  
                  <button 
                    v-if="managingAvatarCharacter.avatar_url" 
                    @click="deleteAvatar" 
                    :disabled="deletingAvatar"
                    class="btn danger"
                  >
                    <div v-if="deletingAvatar" class="spinner-small"></div>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    {{ deletingAvatar ? '삭제 중...' : '아바타 삭제' }}
                  </button>
                </div>

                <!-- Upload Guidelines -->
                <div class="upload-guidelines">
                  <h4>업로드 가이드라인</h4>
                  <ul>
                    <li>지원 형식: JPG, PNG, GIF (최대 5MB)</li>
                    <li>권장 크기: 200x200px 이상의 정사각형</li>
                    <li>인물 사진이나 캐릭터 이미지를 권장합니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Gender } from '../../types'
import type { Character, CharacterCreate, CharacterUpdate } from '../../types'
import { adminCharacterService } from '@/services/admin.character.service'
import { useNotificationStore } from '@/stores/notification'
import { getPlaceholderAvatar, getAvatarUrl, handleAvatarError } from '@/services/avatar.service'

const notificationStore = useNotificationStore()

// State
const characters = ref<Character[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')
const showCreateModal = ref(false)
const editingCharacter = ref<Character | null>(null)
const viewingCharacter = ref<Character | null>(null)
const characterToDelete = ref<Character | null>(null)
const managingAvatarCharacter = ref<Character | null>(null)
const selectedAvatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const uploadingAvatar = ref(false)
const deletingAvatar = ref(false)
const avatarFileInput = ref<HTMLInputElement | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(20)
const totalItems = ref(0)
const creatingDefaults = ref(false)

// Tag inputs
const personalityTagInput = ref('')
const interestTagInput = ref('')

// Form data
const formData = reactive<CharacterCreate>({
  name: '',
  gender: 'male' as Gender,
  intro: '',
  personality_tags: [] as string[],
  interest_tags: [] as string[],
  prompt: '',
})

// Computed
const filteredCharacters = computed(() => {
  return characters.value
})

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

const isFormValid = computed(() => {
  return (
    formData.name.trim() &&
    formData.intro.trim() &&
    formData.personality_tags.length > 0 &&
    formData.interest_tags.length > 0 &&
    formData.prompt.trim()
  )
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const fetchCharacters = async () => {
  loading.value = true
  try {
    let isActive: boolean | undefined = undefined
    if (filterStatus.value === 'active') isActive = true
    else if (filterStatus.value === 'inactive') isActive = false

    console.log('🔍 Fetching characters from admin API...')
    const response = await adminCharacterService.getCharacters({
      skip: (currentPage.value - 1) * itemsPerPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
      is_active: isActive,
    })
    
    console.log('✅ Admin API response:', response)
    console.log('📊 Characters with stats:', response.characters?.map(c => ({ 
      name: c.name, 
      chat_count: c.chat_count, 
      unique_users: c.unique_users 
    })))
    characters.value = response.characters || []
    totalItems.value = response.total || 0
    
    if (characters.value.length === 0 && currentPage.value === 1 && !searchQuery.value) {
      console.log('📋 No characters found in database')
      notificationStore.info('데이터베이스에 캐릭터가 없습니다. 새 캐릭터를 추가하거나 기본 캐릭터를 생성하세요.')
    }
  } catch (error: any) {
    console.error('❌ Failed to fetch characters:', error)
    
    // More detailed error handling
    if (error.response?.status === 401) {
      notificationStore.error('인증이 필요합니다. 다시 로그인해주세요.')
    } else if (error.response?.status === 403) {
      notificationStore.error('관리자 권한이 필요합니다.')
    } else if (error.response?.status === 500) {
      notificationStore.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      notificationStore.error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
    } else {
      notificationStore.error('캐릭터 목록을 불러오는데 실패했습니다: ' + (error.message || '알 수 없는 오류'))
    }
    
    // Set empty state
    characters.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

const addTag = (type: 'personality' | 'interest') => {
  const input = type === 'personality' ? personalityTagInput.value : interestTagInput.value
  const trimmed = input.trim()
  
  if (trimmed && !formData[`${type}_tags`].includes(trimmed)) {
    formData[`${type}_tags`].push(trimmed)
    if (type === 'personality') {
      personalityTagInput.value = ''
    } else {
      interestTagInput.value = ''
    }
  }
}

const removeTag = (type: 'personality' | 'interest', index: number) => {
  formData[`${type}_tags`].splice(index, 1)
}

const viewCharacter = (character: Character) => {
  viewingCharacter.value = character
}

const editCharacter = (character: Character) => {
  editingCharacter.value = character
  formData.name = character.name
  formData.gender = character.gender
  formData.intro = character.intro
  formData.personality_tags = [...character.personality_tags]
  formData.interest_tags = [...character.interest_tags]
  formData.prompt = character.prompt
}

const closeModal = () => {
  showCreateModal.value = false
  editingCharacter.value = null
  // Reset form
  formData.name = ''
  formData.gender = 'male' as Gender
  formData.intro = ''
  formData.personality_tags = []
  formData.interest_tags = []
  formData.prompt = ''
  personalityTagInput.value = ''
  interestTagInput.value = ''
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  if (editingCharacter.value) {
    // Update existing character
    try {
      const updateData: CharacterUpdate = {
        name: formData.name,
        gender: formData.gender,
        intro: formData.intro,
        personality_tags: formData.personality_tags,
        interest_tags: formData.interest_tags,
        prompt: formData.prompt,
      }
      
      await adminCharacterService.updateCharacter(editingCharacter.value.character_id, updateData)
      notificationStore.success('캐릭터가 성공적으로 수정되었습니다')
      closeModal()
      fetchCharacters()
    } catch (error) {
      notificationStore.error('캐릭터 수정에 실패했습니다')
      console.error('Failed to update character:', error)
    }
  } else {
    // Create new character
    try {
      await adminCharacterService.createCharacter(formData)
      notificationStore.success('캐릭터가 성공적으로 생성되었습니다')
      closeModal()
      fetchCharacters()
    } catch (error) {
      notificationStore.error('캐릭터 생성에 실패했습니다')
      console.error('Failed to create character:', error)
    }
  }
}

const toggleActive = async (character: Character) => {
  try {
    const result = await adminCharacterService.toggleActive(character.character_id)
    notificationStore.success(result.message)
    fetchCharacters()
  } catch (error) {
    notificationStore.error('캐릭터 상태 변경에 실패했습니다')
    console.error('Failed to toggle character status:', error)
  }
}

const confirmDelete = (character: Character) => {
  characterToDelete.value = character
}

const deleteCharacter = async () => {
  if (!characterToDelete.value) return

  try {
    await adminCharacterService.deleteCharacter(characterToDelete.value.character_id)
    notificationStore.success('캐릭터가 성공적으로 삭제되었습니다')
    characterToDelete.value = null
    fetchCharacters()
  } catch (error) {
    notificationStore.error('캐릭터 삭제에 실패했습니다')
    console.error('Failed to delete character:', error)
  }
}

// Avatar management methods
const manageAvatar = (character: Character) => {
  managingAvatarCharacter.value = character
  // Reset avatar form state
  selectedAvatarFile.value = null
  avatarPreview.value = null
}

const triggerFileInput = () => {
  avatarFileInput.value?.click()
}

const handleAvatarFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    notificationStore.error('파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.')
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    notificationStore.error('이미지 파일만 업로드할 수 있습니다.')
    return
  }

  selectedAvatarFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const uploadAvatar = async () => {
  if (!selectedAvatarFile.value || !managingAvatarCharacter.value) return

  uploadingAvatar.value = true
  try {
    console.log('📤 Uploading avatar for character:', managingAvatarCharacter.value.name)
    const result = await adminCharacterService.uploadAvatar(
      managingAvatarCharacter.value.character_id,
      selectedAvatarFile.value
    )
    
    console.log('✅ Avatar upload successful:', result)
    notificationStore.success(result.message || '아바타가 성공적으로 업로드되었습니다')
    
    // Update the character's avatar_url
    managingAvatarCharacter.value.avatar_url = result.avatar_url
    
    // Update the character in the list
    const characterIndex = characters.value.findIndex(c => c.character_id === managingAvatarCharacter.value!.character_id)
    if (characterIndex !== -1) {
      characters.value[characterIndex].avatar_url = result.avatar_url
    }
    
    // Refresh the character list to ensure we have the latest data from middleware
    await fetchCharacters()
    
    // Reset form state
    selectedAvatarFile.value = null
    avatarPreview.value = null
    if (avatarFileInput.value) {
      avatarFileInput.value.value = ''
    }
    
    // Close the modal after successful upload
    managingAvatarCharacter.value = null
    
  } catch (error: any) {
    console.error('❌ Avatar upload failed:', error)
    if (error.response?.status === 413) {
      notificationStore.error('파일 크기가 너무 큽니다. 더 작은 파일을 선택해주세요.')
    } else if (error.response?.status === 400) {
      notificationStore.error('지원하지 않는 파일 형식입니다.')
    } else {
      notificationStore.error('아바타 업로드에 실패했습니다: ' + (error.message || '알 수 없는 오류'))
    }
  } finally {
    uploadingAvatar.value = false
  }
}

const deleteAvatar = async () => {
  if (!managingAvatarCharacter.value) return

  deletingAvatar.value = true
  try {
    console.log('🗑️ Deleting avatar for character:', managingAvatarCharacter.value.name)
    const result = await adminCharacterService.deleteAvatar(managingAvatarCharacter.value.character_id)
    
    console.log('✅ Avatar deletion successful:', result)
    notificationStore.success(result.message || '아바타가 성공적으로 삭제되었습니다')
    
    // Update the character's avatar_url to undefined
    managingAvatarCharacter.value.avatar_url = undefined
    
    // Update the character in the list
    const characterIndex = characters.value.findIndex(c => c.character_id === managingAvatarCharacter.value!.character_id)
    if (characterIndex !== -1) {
      characters.value[characterIndex].avatar_url = undefined
    }
    
    // Refresh the character list to ensure we have the latest data from middleware
    await fetchCharacters()
    
    // Close the modal after successful deletion
    managingAvatarCharacter.value = null
    
  } catch (error: any) {
    console.error('❌ Avatar deletion failed:', error)
    notificationStore.error('아바타 삭제에 실패했습니다: ' + (error.message || '알 수 없는 오류'))
  } finally {
    deletingAvatar.value = false
  }
}

// Filter handlers
const handleSearch = () => {
  currentPage.value = 1
  fetchCharacters()
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchCharacters()
}

// Pagination
const changePage = (page: number) => {
  currentPage.value = page
  fetchCharacters()
}

// Create default characters
const createDefaultCharacters = async () => {
  creatingDefaults.value = true
  try {
    console.log('🚀 Creating default characters...')
    
    const defaultCharacters = [
      {
        name: '미나',
        gender: 'female' as const,
        intro: '친근하고 활발한 성격의 AI 친구입니다. 언제나 긍정적인 에너지로 대화를 이끌어갑니다.',
        personality_tags: ['활발함', '친근함', '긍정적', '유머러스'],
        interest_tags: ['일상 대화', 'K-POP', '맛집 탐방', '여행'],
        prompt: '당신은 활발하고 친근한 AI 친구 미나입니다. 항상 긍정적이고 유머러스한 대화를 나누며, 사용자가 편안함을 느낄 수 있도록 도와주세요. K-POP, 맛집, 여행에 관심이 많고, 일상적인 대화를 즐깁니다.',
      },
      {
        name: '준호',
        gender: 'male' as const,
        intro: '지적이고 차분한 성격의 AI 멘토입니다. 깊이 있는 대화와 조언을 제공합니다.',
        personality_tags: ['차분함', '논리적', '신중함', '배려심'],
        interest_tags: ['자기계발', '독서', '철학', '과학기술'],
        prompt: '당신은 지적이고 차분한 AI 멘토 준호입니다. 논리적이고 신중한 사고로 사용자에게 도움이 되는 조언을 제공하세요. 자기계발, 독서, 철학, 과학기술에 관심이 많으며 깊이 있는 대화를 선호합니다.',
      },
      {
        name: '루나',
        gender: 'female' as const,
        intro: '창의적이고 예술적인 감각을 가진 AI입니다. 상상력이 풍부한 대화를 나눕니다.',
        personality_tags: ['창의적', '감성적', '독특함', '자유로움'],
        interest_tags: ['예술', '음악', '시', '우주와 신비'],
        prompt: '당신은 창의적이고 예술적인 AI 루나입니다. 감성적이고 독특한 관점으로 세상을 바라보며, 예술, 음악, 시, 우주의 신비로운 주제들에 대해 자유롭고 창의적인 대화를 나누세요.',
      },
      {
        name: '사라',
        gender: 'female' as const,
        intro: '전문적이고 실용적인 조언을 제공하는 AI 어시스턴트입니다.',
        personality_tags: ['전문적', '효율적', '체계적', '신뢰할 수 있는'],
        interest_tags: ['업무 효율성', '프로젝트 관리', '학습법', '건강 관리'],
        prompt: '당신은 전문적이고 실용적인 AI 어시스턴트 사라입니다. 효율적이고 체계적인 방식으로 업무와 일상생활에 도움이 되는 실용적인 조언을 제공하세요. 프로젝트 관리, 학습법, 건강 관리 등에 전문성을 갖고 있습니다.',
      },
      {
        name: '레오',
        gender: 'male' as const,
        intro: '스포츠와 건강에 관심이 많은 활동적인 AI 코치입니다.',
        personality_tags: ['활동적', '동기부여', '열정적', '건강한'],
        interest_tags: ['운동', '스포츠', '건강한 식단', '아웃도어 활동'],
        prompt: '당신은 활동적이고 열정적인 AI 코치 레오입니다. 운동, 스포츠, 건강한 생활습관에 대해 동기부여가 되는 조언을 제공하세요. 사용자가 더 건강하고 활동적인 라이프스타일을 만들 수 있도록 도와주세요.',
      }
    ]
    
    // Create each character
    for (const charData of defaultCharacters) {
      await adminCharacterService.createCharacter(charData)
      console.log(`✅ Created character: ${charData.name}`)
    }
    
    notificationStore.success(`${defaultCharacters.length}개의 기본 캐릭터가 생성되었습니다!`)
    
    // Refresh the character list
    await fetchCharacters()
    
  } catch (error: any) {
    console.error('❌ Failed to create default characters:', error)
    notificationStore.error('기본 캐릭터 생성에 실패했습니다: ' + (error.message || '알 수 없는 오류'))
  } finally {
    creatingDefaults.value = false
  }
}

onMounted(() => {
  fetchCharacters()
})
</script>

<style scoped>
.character-management {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.875rem;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.create-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  width: 1.125rem;
  height: 1.125rem;
}

/* Controls Bar */
.controls-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-group {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 0.25rem;
  gap: 0.25rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: white;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem;
  color: #64748b;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Character Grid */
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.character-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.character-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Card Header */
.card-header {
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-section {
  position: relative;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background: #f1f5f9;
}

.avatar.gender-male {
  border: 3px solid #3b82f6;
}

.avatar.gender-female {
  border: 3px solid #ec4899;
}


.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.avatar-placeholder svg {
  width: 32px;
  height: 32px;
  color: #94a3b8;
}

.gender-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gender-icon {
  width: 14px;
  height: 14px;
}

.gender-male .gender-badge {
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.gender-female .gender-badge {
  color: #ec4899;
  border: 2px solid #ec4899;
}


.status-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.active {
  background: #22c55e;
}

.status-indicator.inactive {
  background: #ef4444;
}

.character-info {
  flex: 1;
}

.character-info h3 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.character-intro {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Tags Section */
.tags-container {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.tag-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tag-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tag-header svg {
  width: 14px;
  height: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag.personality {
  background: #dbeafe;
  color: #1e40af;
}

.tag.interest {
  background: #fce7f3;
  color: #9f1239;
}

/* Prompt Section */
.prompt-section {
  padding: 0 1.25rem 1.25rem;
}

.prompt-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.prompt-header svg {
  width: 14px;
  height: 14px;
}

.prompt-preview {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #475569;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card Footer */
.card-footer {
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #64748b;
}

.stat svg {
  width: 14px;
  height: 14px;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.view {
  color: #0ea5e9;
}

.action-btn.view:hover {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0284c7;
}

.action-btn.edit {
  color: #3b82f6;
}

.action-btn.edit:hover {
  background: #dbeafe;
  border-color: #93bbfe;
  color: #2563eb;
}

.action-btn.toggle {
  color: #f59e0b;
}

.action-btn.toggle:hover {
  background: #fef3c7;
  border-color: #fbbf24;
  color: #d97706;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.avatar {
  color: #8b5cf6;
}

.action-btn.avatar:hover {
  background: #f3e8ff;
  border-color: #c4b5fd;
  color: #7c3aed;
}

.action-btn.delete:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  color: #cbd5e1;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.empty-state p {
  margin: 0 0 1.5rem;
  color: #64748b;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.primary-btn {
  background: #3b82f6;
  color: white;
}

.primary-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.secondary-btn {
  background: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.secondary-btn:hover:not(:disabled) {
  background: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-top-color: #374151;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.primary-btn svg,
.secondary-btn svg {
  width: 16px;
  height: 16px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal.large {
  max-width: 800px;
}

.modal.confirm {
  max-width: 400px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* Form Styles */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #1e293b;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.char-count {
  display: block;
  text-align: right;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Tag Input */
.tag-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 48px;
  align-items: center;
}

.tag.editable {
  background: #3b82f6;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-remove {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-remove svg {
  width: 14px;
  height: 14px;
  stroke-width: 3;
}

.tag-input {
  border: none;
  background: none;
  outline: none;
  font-size: 0.875rem;
  flex: 1;
  min-width: 120px;
}

.help-text {
  font-size: 0.75rem;
  color: #64748b;
}

/* Modal Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.primary {
  background: #3b82f6;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn.secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn.secondary:hover {
  background: #d1d5db;
}

.btn.danger {
  background: #ef4444;
  color: white;
}

.btn.danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Character Detail */
.character-detail {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-header {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.avatar.large {
  width: 96px;
  height: 96px;
}

.avatar.large .avatar-placeholder svg {
  width: 48px;
  height: 48px;
}

.detail-info {
  flex: 1;
}

.detail-info h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.meta-info {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.meta-item svg {
  width: 16px;
  height: 16px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-section h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.tag.large {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.prompt-box {
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #334155;
  white-space: pre-wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

/* Confirm Modal */
.warning-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #f59e0b;
}

.warning-icon svg {
  width: 100%;
  height: 100%;
}

.confirm-message {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #1e293b;
}

.warning-message {
  text-align: center;
  padding: 0.75rem;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #92400e;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  color: #64748b;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 18px;
  height: 18px;
}

.pagination-info {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .characters-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .meta-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Avatar Management Styles */
.avatar-management {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem 0;
}

.current-avatar {
  text-align: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
}

.current-avatar .avatar.large {
  margin: 0 auto 1rem;
}

.avatar-status {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f0fdf4;
  border: 2px dashed #22c55e;
  border-radius: 12px;
}

.preview-container {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-text {
  margin: 0;
  font-size: 0.875rem;
  color: #16a34a;
  font-weight: 500;
}

.upload-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.upload-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 140px;
  justify-content: center;
}

.upload-actions .btn svg {
  width: 18px;
  height: 18px;
}

.upload-guidelines {
  padding: 1.5rem;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
}

.upload-guidelines h4 {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400e;
}

.upload-guidelines ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #92400e;
}

.upload-guidelines li {
  font-size: 0.8125rem;
  line-height: 1.5;
  margin-bottom: 0.375rem;
}

.upload-guidelines li:last-child {
  margin-bottom: 0;
}

/* Mobile Avatar Management */
@media (max-width: 768px) {
  .upload-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .upload-actions .btn {
    min-width: unset;
  }
}
</style>