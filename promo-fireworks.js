(() => {
    const STORAGE_KEY = "gold-casino.promotion-flow.v2";
    const FIRST_DELAY = 10000;
    const SECOND_DELAY_MIN = 35000;
    const SECOND_DELAY_MAX = 60000;

    if (!document.querySelector("[data-promo-notice]")) {
        document.body.insertAdjacentHTML("beforeend", `
            <aside class="promo-notice" data-promo-notice aria-hidden="true">
                <button class="promo-notice__close" type="button" data-promo-notice-close aria-label="프로모션 알림 닫기">×</button>
                <div class="container promo-notice__inner">
                    <div class="promo-notice__icon" data-promo-notice-icon aria-hidden="true">G</div>
                    <div class="promo-notice__copy">
                        <small data-promo-notice-label>GOLD CASINOSOLUTION SPECIAL REWARD</small>
                        <strong data-promo-notice-title>프로모션 혜택에 당첨되셨습니다</strong>
                        <p data-promo-notice-description>카지노사이트 제작비 전액 무료 혜택과 적용 조건을 확인하세요.</p>
                    </div>
                    <button class="promo-notice__button" type="button" data-promo-trigger>당첨 확인하기</button>
                </div>
            </aside>
        `);
    }

    if (!document.querySelector("[data-promo-modal]")) {
        document.body.insertAdjacentHTML("beforeend", `
            <div class="promo-modal" data-promo-modal role="dialog" aria-modal="true" aria-labelledby="promoTitle" aria-hidden="true">
                <button class="promo-modal__backdrop" type="button" data-promo-close aria-label="프로모션 닫기"></button>
                <section class="promo-modal__card">
                    <button class="promo-modal__close" type="button" data-promo-close aria-label="프로모션 닫기">×</button>
                    <div class="promo-modal__grid">
                        <div class="promo-modal__banner">
                            <img src="/images/promotion_banner.png" alt="GOLD CASINO SOLUTION SPECIAL REWARD">
                        </div>
                        <div class="promo-modal__offer">
                            <small>GOLD CASINOSOLUTION SPECIAL OFFER</small>
                            <h2 id="promoTitle"><span>제작비</span> 전액 무료!</h2>
                            <p>지금 문의해 주시면 운영 계획을 확인한 뒤 적용 가능한 제작 범위부터 안내합니다.</p>
                            <div class="promo-modal__code">
                                <span>A</span><span>S</span><span>O</span><span>L</span><span>2</span><span>0</span><span>2</span><span>6</span>
                                <small>프로모션 코드 자동 입력</small>
                            </div>
                            <ul class="promo-modal__benefits">
                                <li>카지노사이트 기본 화면 제작비 지원</li>
                                <li>운영 방식에 맞춘 메뉴와 페이지 구성</li>
                                <li>게임·관리자·서버 연동 범위 상담</li>
                                <li>오픈 준비 항목과 진행 일정 안내</li>
                            </ul>
                            <small class="promo-modal__note">※ 무료 적용 범위와 세부 조건은 상담 후 확정됩니다.</small>
                            <div class="promo-modal__actions">
                                <a href="https://t.me/asolution12" target="_blank" rel="noopener noreferrer">프로모션 혜택 받기</a>
                                <a href="https://t.me/asolution12" target="_blank" rel="noopener noreferrer">텔레그램 문의하기</a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        `);
    }

    const trigger = document.querySelector("[data-promo-trigger]");
    const modal = document.querySelector("[data-promo-modal]");
    const notice = document.querySelector("[data-promo-notice]");
    const noticeClose = document.querySelector("[data-promo-notice-close]");
    if (!trigger || !modal || !notice) return;

    const closeButtons = modal.querySelectorAll("[data-promo-close]");
    const closeControl = modal.querySelector(".promo-modal__close");
    const noticeIcon = notice.querySelector("[data-promo-notice-icon]") || notice.querySelector(".promo-notice__icon");
    const noticeLabel = notice.querySelector("[data-promo-notice-label]") || notice.querySelector(".promo-notice__copy small");
    const noticeTitle = notice.querySelector("[data-promo-notice-title]") || notice.querySelector(".promo-notice__copy strong");
    const noticeDescription = notice.querySelector("[data-promo-notice-description]") || notice.querySelector(".promo-notice__copy p");
    let noticeTimer;
    let activeStage;

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (saved && ["waiting-first", "waiting-second", "done"].includes(saved.stage)) return saved;
        } catch (error) {
            // 저장소를 사용할 수 없으면 현재 페이지에서만 순서를 유지한다.
        }
        return { stage: "waiting-first", dueAt: Date.now() + FIRST_DELAY };
    }

    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            // 저장소가 차단되어도 현재 페이지의 타이머는 계속 동작한다.
        }
    }

    function applyNoticeVariant(stage) {
        activeStage = stage;
        const followup = stage === "waiting-second";
        notice.classList.toggle("promo-notice--followup", followup);
        if (noticeIcon) noticeIcon.textContent = followup ? "🎁" : "G";
        if (noticeLabel) {
            noticeLabel.textContent = followup
                ? "GOLD CASINOSOLUTION SUPPORT CODE"
                : "GOLD CASINOSOLUTION SPECIAL REWARD";
        }
        if (noticeTitle) {
            noticeTitle.textContent = followup
                ? "제작비 지원 코드가 도착했습니다"
                : "프로모션 혜택에 당첨되셨습니다";
        }
        if (noticeDescription) {
            noticeDescription.textContent = followup
                ? "제작비 지원 코드와 적용 가능한 혜택을 지금 확인하세요."
                : "카지노사이트 제작비 전액 무료 혜택과 적용 조건을 확인하세요.";
        }
        trigger.textContent = followup ? "제작비 지원 코드 확인하기" : "당첨 확인하기";
    }

    function showNotice(stage) {
        applyNoticeVariant(stage);
        notice.classList.add("is-visible");
        notice.setAttribute("aria-hidden", "false");
    }

    function scheduleNotice(state) {
        window.clearTimeout(noticeTimer);
        if (state.stage === "done") return;
        const delay = Math.max(0, Number(state.dueAt) - Date.now());
        noticeTimer = window.setTimeout(() => showNotice(state.stage), delay);
    }

    function dismissNotice(showModal) {
        const wasFirst = activeStage === "waiting-first";
        const nextState = wasFirst
            ? {
                stage: "waiting-second",
                dueAt: Date.now() + SECOND_DELAY_MIN
                    + Math.floor(Math.random() * (SECOND_DELAY_MAX - SECOND_DELAY_MIN + 1))
            }
            : { stage: "done", dueAt: null };

        notice.classList.remove("is-visible");
        notice.setAttribute("aria-hidden", "true");
        saveState(nextState);
        scheduleNotice(nextState);
        if (showModal) openPromo();
    }

    function closePromo() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("promo-modal-open");
        document.documentElement.style.removeProperty("--promo-scrollbar-width");
    }

    function createFirework(startRatio, endRatio, colorOffset = 0) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: true });
        if (!context) return;

        canvas.className = "promo-firework-canvas";
        canvas.setAttribute("aria-hidden", "true");
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);

        const colors = ["#ff4f64", "#ffd84d", "#ff6f91", "#fff1a5", "#e7bb51"];
        const start = { x: width * startRatio, y: height + 20 };
        const end = {
            x: width * endRatio,
            y: height * (.18 + Math.random() * .22)
        };
        const curveDirection = Math.random() < .5 ? -1 : 1;
        const flightDuration = 760 + Math.random() * 180;
        const launchTime = performance.now();
        let previousTime = launchTime;
        let explosionTime = 0;
        let particles = [];

        function createExplosion() {
            const mainCount = 32;
            const microCount = 28;
            const mainParticles = Array.from({ length: mainCount }, (_, index) => {
                const angle = Math.PI * 2 * index / mainCount + (Math.random() - .5) * .12;
                const speed = 94 + Math.random() * 98;
                return {
                    x: end.x,
                    y: end.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    drag: .982,
                    gravity: 138,
                    life: 1.8 + Math.random() * .4,
                    age: 0,
                    size: 4 + Math.random() * 4,
                    color: colors[(index + colorOffset) % colors.length],
                    micro: false
                };
            });
            const microParticles = Array.from({ length: microCount }, (_, index) => {
                const angle = Math.PI * 2 * index / microCount + (Math.random() - .5) * .22;
                const speed = 135 + Math.random() * 85;
                return {
                    x: end.x,
                    y: end.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    drag: .978,
                    gravity: 105,
                    life: 1.05 + Math.random() * .4,
                    age: 0,
                    size: 2.5 + Math.random() * 2,
                    color: colors[(index * 2 + colorOffset + 1) % colors.length],
                    micro: true
                };
            });
            particles = mainParticles.concat(microParticles);
            explosionTime = performance.now();
        }

        function animate(time) {
            const deltaTime = Math.min(.032, (time - previousTime) / 1000);
            previousTime = time;
            context.clearRect(0, 0, width, height);
            const progress = Math.min(1, (time - launchTime) / flightDuration);

            if (!explosionTime) {
                const eased = 1 - Math.pow(1 - progress, 2.4);
                const sCurve = Math.sin(progress * Math.PI * 2)
                    * Math.sin(progress * Math.PI)
                    * 48
                    * curveDirection;
                const x = start.x + (end.x - start.x) * eased + sCurve;
                const y = start.y + (end.y - start.y) * eased;
                const trail = context.createLinearGradient(x, y, x, y + 30);
                trail.addColorStop(0, "rgba(255,216,77,.95)");
                trail.addColorStop(.5, "rgba(255,79,100,.58)");
                trail.addColorStop(1, "rgba(255,79,100,0)");
                context.strokeStyle = trail;
                context.lineWidth = 3;
                context.beginPath();
                context.moveTo(x, y + 4);
                context.lineTo(x, y + 30);
                context.stroke();
                context.fillStyle = "#fff5b7";
                context.shadowColor = "#ffd84d";
                context.shadowBlur = 9;
                context.beginPath();
                context.arc(x, y, 4.5, 0, Math.PI * 2);
                context.fill();
                context.shadowBlur = 0;

                if (progress >= 1) createExplosion();
            } else {
                const ringProgress = Math.min(1, (time - explosionTime) / 720);
                if (ringProgress < 1) {
                    context.globalAlpha = 1 - ringProgress;
                    context.strokeStyle = "#fff";
                    context.lineWidth = 2;
                    context.beginPath();
                    context.arc(end.x, end.y, 2 + ringProgress * 36, 0, Math.PI * 2);
                    context.stroke();
                    context.globalAlpha = 1;
                }

                let activeCount = 0;
                particles.forEach((particle) => {
                    if (particle.age >= particle.life) return;
                    activeCount += 1;
                    particle.age += deltaTime;
                    const drag = Math.pow(particle.drag, deltaTime * 60);
                    particle.vx *= drag;
                    particle.vy = particle.vy * drag + particle.gravity * deltaTime;
                    particle.x += particle.vx * deltaTime;
                    particle.y += particle.vy * deltaTime;
                    const particleProgress = Math.min(1, particle.age / particle.life);
                    const fade = particleProgress < .58 ? 1 : (1 - particleProgress) / .42;
                    context.globalAlpha = Math.max(0, fade);
                    context.fillStyle = particle.color;
                    context.shadowColor = particle.color;
                    context.shadowBlur = particle.micro ? 5 : 0;
                    context.beginPath();
                    context.arc(
                        particle.x,
                        particle.y,
                        particle.size * (1 - particleProgress * .45) / 2,
                        0,
                        Math.PI * 2
                    );
                    context.fill();
                });
                context.globalAlpha = 1;
                context.shadowBlur = 0;

                if (!activeCount) {
                    canvas.remove();
                    return;
                }
            }

            window.requestAnimationFrame(animate);
        }

        window.requestAnimationFrame(animate);
    }

    function launchFireworkSequence() {
        createFirework(.5, .34, 0);
        window.setTimeout(() => createFirework(.42, .52, 2), 420);
        window.setTimeout(() => createFirework(.58, .68, 4), 620);
    }

    function openPromo() {
        const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
        document.documentElement.style.setProperty("--promo-scrollbar-width", `${scrollbarWidth}px`);
        document.body.classList.add("promo-modal-open");
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        closeControl?.focus();
        launchFireworkSequence();
    }

    trigger.addEventListener("click", () => dismissNotice(true));
    noticeClose?.addEventListener("click", () => dismissNotice(false));
    closeButtons.forEach((button) => button.addEventListener("click", closePromo));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) closePromo();
    });
    const initialState = loadState();
    saveState(initialState);
    scheduleNotice(initialState);
})();
