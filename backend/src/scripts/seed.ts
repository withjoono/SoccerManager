/**
 * 데이터베이스 시드 스크립트
 * 개발 및 테스트 환경용 더미 데이터 생성
 * 
 * 실행: npm run seed
 */

import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

// ========================================
// 더미 데이터
// ========================================

const dummyTeams = [
  { name: '레드팀', color: '#EF4444', description: '공격형 팀' },
  { name: '블루팀', color: '#3B82F6', description: '수비형 팀' },
  { name: '그린팀', color: '#10B981', description: '균형형 팀' },
];

const dummyMembers = [
  { name: '홍길동', phone: '010-1111-1111', position: 'FW', jerseyNumber: 10 },
  { name: '김철수', phone: '010-2222-2222', position: 'MF', jerseyNumber: 7 },
  { name: '박영희', phone: '010-3333-3333', position: 'DF', jerseyNumber: 4 },
  { name: '이민준', phone: '010-4444-4444', position: 'GK', jerseyNumber: 1 },
  { name: '최수진', phone: '010-5555-5555', position: 'FW', jerseyNumber: 9 },
  { name: '정하은', phone: '010-6666-6666', position: 'MF', jerseyNumber: 8 },
  { name: '강민수', phone: '010-7777-7777', position: 'DF', jerseyNumber: 5 },
  { name: '윤서아', phone: '010-8888-8888', position: 'MF', jerseyNumber: 6 },
  { name: '임준호', phone: '010-9999-9999', position: 'FW', jerseyNumber: 11 },
  { name: '한지우', phone: '010-1010-1010', position: 'DF', jerseyNumber: 3 },
  { name: '송민지', phone: '010-1212-1212', position: 'MF', jerseyNumber: 14 },
  { name: '장서준', phone: '010-1313-1313', position: 'FW', jerseyNumber: 19 },
];

const dummyNotices = [
  {
    title: '새해 첫 경기 일정 공지',
    content: '2026년 첫 경기가 1월 8일 수요일 오후 3시에 서울 운동장에서 진행됩니다. 많은 참여 부탁드립니다!',
    important: true,
    isActive: true,
  },
  {
    title: '경기장 위치 변경 안내',
    content: '다음 주 경기장이 강남 풋살장으로 변경되었습니다. 주소는 서울시 강남구 테헤란로 123입니다.',
    important: false,
    isActive: true,
  },
  {
    title: '회비 납부 안내',
    content: '1월 회비 납부 기한은 1월 15일까지입니다. 계좌번호: 국민은행 123-456-789012',
    important: true,
    isActive: true,
  },
];

// ========================================
// 시드 함수
// ========================================

async function clearCollections() {
  console.log('🗑️  기존 데이터 삭제 중...');
  
  const collections = [
    'members',
    'teams',
    'matches',
    'attendances',
    'teamAssignments',
    'matchEvents',
    'notices',
    'notifications',
    'statistics',
  ];
  
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    if (!snapshot.empty) {
      await batch.commit();
      console.log(`  ✅ ${collectionName}: ${snapshot.size}개 삭제됨`);
    }
  }
}

async function seedTeams() {
  console.log('\n👥 팀 생성 중...');
  
  const teamIds: string[] = [];
  
  for (const team of dummyTeams) {
    const docRef = await db.collection('teams').add({
      ...team,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    teamIds.push(docRef.id);
    console.log(`  ✅ ${team.name} 생성됨 (${docRef.id})`);
  }
  
  return teamIds;
}

async function seedMembers(teamIds: string[]) {
  console.log('\n👤 회원 생성 중...');
  
  const memberIds: string[] = [];
  
  for (let i = 0; i < dummyMembers.length; i++) {
    const member = dummyMembers[i];
    const teamId = teamIds[i % teamIds.length]; // 팀 순환 할당
    
    const docRef = await db.collection('members').add({
      ...member,
      teamId,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    memberIds.push(docRef.id);
    console.log(`  ✅ ${member.name} 생성됨 (${docRef.id})`);
  }
  
  return memberIds;
}

async function seedMatches() {
  console.log('\n⚽ 경기 생성 중...');
  
  const matchIds: string[] = [];
  const now = new Date();
  
  // 과거 경기 3개 (완료됨)
  for (let i = 3; i >= 1; i--) {
    const matchDate = new Date(now);
    matchDate.setDate(matchDate.getDate() - i * 7); // 1주 간격
    
    const docRef = await db.collection('matches').add({
      title: `정기 경기`,
      date: admin.firestore.Timestamp.fromDate(matchDate),
      matchNumber: 1,
      location: '서울 운동장',
      notes: '15:00 ~ 17:00',
      status: 'completed',
      scoreA: Math.floor(Math.random() * 5) + 1,
      scoreB: Math.floor(Math.random() * 5) + 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    matchIds.push(docRef.id);
    console.log(`  ✅ 과거 경기 생성됨 (${docRef.id})`);
  }
  
  // 미래 경기 2개 (예정됨)
  for (let i = 1; i <= 2; i++) {
    const matchDate = new Date(now);
    matchDate.setDate(matchDate.getDate() + i * 7); // 1주 간격
    
    const docRef = await db.collection('matches').add({
      title: `정기 경기`,
      date: admin.firestore.Timestamp.fromDate(matchDate),
      matchNumber: 1,
      location: '서울 운동장',
      notes: '15:00 ~ 17:00',
      status: 'scheduled',
      scoreA: 0,
      scoreB: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    matchIds.push(docRef.id);
    console.log(`  ✅ 미래 경기 생성됨 (${docRef.id})`);
  }
  
  return matchIds;
}

async function seedAttendances(matchIds: string[], memberIds: string[]) {
  console.log('\n✅ 출석 기록 생성 중...');
  
  let count = 0;
  
  for (const matchId of matchIds) {
    const batch = db.batch();
    
    for (const memberId of memberIds) {
      const statuses = ['present', 'present', 'present', 'absent']; // 75% 출석률
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const docRef = db.collection('attendances').doc();
      batch.set(docRef, {
        matchId,
        memberId,
        status,
        checkedAt: status === 'present' ? FieldValue.serverTimestamp() : null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      
      count++;
    }
    
    await batch.commit();
  }
  
  console.log(`  ✅ ${count}개 출석 기록 생성됨`);
}

async function seedTeamAssignments(matchIds: string[], _memberIds: string[]) {
  console.log('\n🎯 팀 구성 생성 중...');
  
  for (const matchId of matchIds) {
    // 출석한 회원 조회
    const attendances = await db
      .collection('attendances')
      .where('matchId', '==', matchId)
      .where('status', '==', 'present')
      .get();
    
    const presentMembers = attendances.docs.map((doc) => doc.data().memberId);
    
    // 랜덤하게 A팀, B팀 분배
    const shuffled = [...presentMembers].sort(() => Math.random() - 0.5);
    const midpoint = Math.floor(shuffled.length / 2);
    
    await db.collection('teamAssignments').add({
      matchId,
      teamA: shuffled.slice(0, midpoint),
      teamB: shuffled.slice(midpoint),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    console.log(`  ✅ 경기 ${matchId}: A팀 ${midpoint}명, B팀 ${shuffled.length - midpoint}명`);
  }
}

async function seedMatchEvents(matchIds: string[], _memberIds: string[]) {
  console.log('\n⚽ 경기 이벤트 생성 중...');
  
  let totalEvents = 0;
  
  for (const matchId of matchIds) {
    // 완료된 경기만
    const matchDoc = await db.collection('matches').doc(matchId).get();
    const matchData = matchDoc.data();
    
    if (matchData?.status !== 'completed') continue;
    
    // 팀 구성 조회
    const assignmentSnapshot = await db
      .collection('teamAssignments')
      .where('matchId', '==', matchId)
      .get();
    
    if (assignmentSnapshot.empty) continue;
    
    const assignment = assignmentSnapshot.docs[0].data();
    const batch = db.batch();
    
    // A팀 골
    for (let i = 0; i < matchData.scoreA; i++) {
      const scorer = assignment.teamA[Math.floor(Math.random() * assignment.teamA.length)];
      const assister =
        Math.random() > 0.3
          ? assignment.teamA[Math.floor(Math.random() * assignment.teamA.length)]
          : 'none';
      
      const docRef = db.collection('matchEvents').doc();
      batch.set(docRef, {
        matchId,
        memberId: scorer,
        assisterId: assister,
        team: 'A',
        type: 'goal',
        createdAt: FieldValue.serverTimestamp(),
      });
      
      totalEvents++;
    }
    
    // B팀 골
    for (let i = 0; i < matchData.scoreB; i++) {
      const scorer = assignment.teamB[Math.floor(Math.random() * assignment.teamB.length)];
      const assister =
        Math.random() > 0.3
          ? assignment.teamB[Math.floor(Math.random() * assignment.teamB.length)]
          : 'none';
      
      const docRef = db.collection('matchEvents').doc();
      batch.set(docRef, {
        matchId,
        memberId: scorer,
        assisterId: assister,
        team: 'B',
        type: 'goal',
        createdAt: FieldValue.serverTimestamp(),
      });
      
      totalEvents++;
    }
    
    await batch.commit();
  }
  
  console.log(`  ✅ ${totalEvents}개 이벤트 생성됨`);
}

async function seedNotices() {
  console.log('\n📢 공지사항 생성 중...');
  
  for (const notice of dummyNotices) {
    await db.collection('notices').add({
      ...notice,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    console.log(`  ✅ ${notice.title} 생성됨`);
  }
}

async function calculateStatistics(memberIds: string[]) {
  console.log('\n📊 통계 계산 중...');
  
  for (const memberId of memberIds) {
    // 출석 통계
    const attendancesSnapshot = await db
      .collection('attendances')
      .where('memberId', '==', memberId)
      .get();
    
    const totalMatches = attendancesSnapshot.size;
    const totalAttendance = attendancesSnapshot.docs.filter(
      (doc) => doc.data().status === 'present'
    ).length;
    const attendanceRate = totalMatches > 0 ? (totalAttendance / totalMatches) * 100 : 0;
    
    // 골 통계
    const goalsSnapshot = await db
      .collection('matchEvents')
      .where('memberId', '==', memberId)
      .where('type', '==', 'goal')
      .get();
    const totalGoals = goalsSnapshot.size;
    
    // 어시스트 통계
    const assistsSnapshot = await db
      .collection('matchEvents')
      .where('assisterId', '==', memberId)
      .get();
    const totalAssists = assistsSnapshot.size;
    
    // 승패 통계 (간단히 랜덤으로 생성)
    const totalWins = Math.floor(Math.random() * totalAttendance);
    const totalLosses = Math.floor(Math.random() * (totalAttendance - totalWins));
    const totalDraws = totalAttendance - totalWins - totalLosses;
    const winRate = totalAttendance > 0 ? (totalWins / totalAttendance) * 100 : 0;
    
    await db.collection('statistics').doc(memberId).set({
      memberId,
      totalMatches,
      totalAttendance,
      attendanceRate,
      totalGoals,
      totalAssists,
      totalWins,
      totalLosses,
      totalDraws,
      winRate,
      lastUpdated: FieldValue.serverTimestamp(),
    });
  }
  
  console.log(`  ✅ ${memberIds.length}명의 통계 계산 완료`);
}

// ========================================
// 메인 실행
// ========================================

async function main() {
  console.log('🚀 데이터베이스 시드 시작\n');
  console.log('⚠️  경고: 모든 기존 데이터가 삭제됩니다!');
  console.log('⏳ 5초 후 시작...\n');
  
  await new Promise((resolve) => setTimeout(resolve, 5000));
  
  try {
    // 1. 기존 데이터 삭제
    await clearCollections();
    
    // 2. 팀 생성
    const teamIds = await seedTeams();
    
    // 3. 회원 생성
    const memberIds = await seedMembers(teamIds);
    
    // 4. 경기 생성
    const matchIds = await seedMatches();
    
    // 5. 출석 기록 생성
    await seedAttendances(matchIds, memberIds);
    
    // 6. 팀 구성 생성
    await seedTeamAssignments(matchIds, memberIds);
    
    // 7. 경기 이벤트 생성
    await seedMatchEvents(matchIds, memberIds);
    
    // 8. 공지사항 생성
    await seedNotices();
    
    // 9. 통계 계산
    await calculateStatistics(memberIds);
    
    console.log('\n✅ 시드 완료!\n');
    console.log('📊 생성된 데이터:');
    console.log(`  - 팀: ${teamIds.length}개`);
    console.log(`  - 회원: ${memberIds.length}명`);
    console.log(`  - 경기: ${matchIds.length}개`);
    console.log(`  - 공지사항: ${dummyNotices.length}개`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
main();








