// 공통 제스처 핸들러
class SwipeGestureHandler {
    constructor(element, options = {}) {
        this.element = element;
        this.onSwipeLeft = options.onSwipeLeft || (() => {});
        this.onSwipeRight = options.onSwipeRight || (() => {});
        this.threshold = options.threshold || 50; // 최소 스와이프 거리
        this.restraint = options.restraint || 100; // 수직 이동 제한
        this.allowedTime = options.allowedTime || 500; // 최대 스와이프 시간
        
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        
        this.init();
    }
    
    init() {
        this.element.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.element.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    }
    
    handleTouchStart(e) {
        const touch = e.changedTouches[0];
        this.startX = touch.pageX;
        this.startY = touch.pageY;
        this.startTime = new Date().getTime();
    }
    
    handleTouchEnd(e) {
        const touch = e.changedTouches[0];
        const distX = touch.pageX - this.startX;
        const distY = touch.pageY - this.startY;
        const elapsedTime = new Date().getTime() - this.startTime;
        
        // 스와이프 조건 확인
        if (elapsedTime <= this.allowedTime) {
            if (Math.abs(distX) >= this.threshold && Math.abs(distY) <= this.restraint) {
                if (distX > 0) {
                    // 오른쪽으로 스와이프 (이전 페이지)
                    this.onSwipeRight();
                } else {
                    // 왼쪽으로 스와이프 (다음 페이지)
                    this.onSwipeLeft();
                }
            }
        }
    }
}

// 페이지 네비게이션 매핑
const pageNavigation = {
    'home.html': {
        prev: null,
        next: 'match-form.html'
    },
    'match-form.html': {
        prev: 'home.html',
        next: 'attendance.html'
    },
    'attendance.html': {
        prev: 'match-form.html',
        next: 'team-assignment.html'
    },
    'team-assignment.html': {
        prev: 'attendance.html',
        next: 'match-result.html'
    },
    'match-result.html': {
        prev: 'team-assignment.html',
        next: 'stats.html'
    },
    'stats.html': {
        prev: 'match-result.html',
        next: 'members.html'
    },
    'members.html': {
        prev: 'stats.html',
        next: 'notifications.html'
    },
    'notifications.html': {
        prev: 'members.html',
        next: null
    }
};

// 현재 페이지 확인
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename;
}

// 페이지 초기화
function initializeGestures() {
    const currentPage = getCurrentPage();
    const nav = pageNavigation[currentPage];
    
    if (!nav) return;
    
    new SwipeGestureHandler(document.body, {
        onSwipeLeft: () => {
            if (nav.next) {
                showSwipeIndicator('다음 페이지로 이동 중...', 'left');
                setTimeout(() => {
                    window.location.href = nav.next;
                }, 200);
            }
        },
        onSwipeRight: () => {
            if (nav.prev) {
                showSwipeIndicator('이전 페이지로 이동 중...', 'right');
                setTimeout(() => {
                    window.location.href = nav.prev;
                }, 200);
            }
        }
    });
}

// 스와이프 인디케이터 표시
function showSwipeIndicator(message, direction) {
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.top = '50%';
    indicator.style.left = '50%';
    indicator.style.transform = 'translate(-50%, -50%)';
    indicator.style.background = 'rgba(0, 0, 0, 0.8)';
    indicator.style.color = 'white';
    indicator.style.padding = '20px 30px';
    indicator.style.borderRadius = '12px';
    indicator.style.fontSize = '16px';
    indicator.style.fontWeight = 'bold';
    indicator.style.zIndex = '10000';
    indicator.style.animation = direction === 'left' ? 'slideLeft 0.3s' : 'slideRight 0.3s';
    indicator.textContent = message;
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        indicator.remove();
    }, 300);
}

// CSS 애니메이션 추가
function addSwipeAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideLeft {
            from { transform: translate(-50%, -50%) translateX(0); opacity: 1; }
            to { transform: translate(-50%, -50%) translateX(-50px); opacity: 0; }
        }
        @keyframes slideRight {
            from { transform: translate(-50%, -50%) translateX(0); opacity: 1; }
            to { transform: translate(-50%, -50%) translateX(50px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    addSwipeAnimations();
    initializeGestures();
});

