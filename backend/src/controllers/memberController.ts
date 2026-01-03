/**
 * 회원 관리 컨트롤러
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebase';
import * as XLSX from 'xlsx';

/**
 * 전체 회원 조회
 */
export async function getAllMembers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { teamId, isActive } = req.query;

    let query: any = getDb().collection('members');

    if (teamId) {
      query = query.where('teamId', '==', teamId);
    }

    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    const snapshot = await query.orderBy('name', 'asc').get();

    const members = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: members,
      count: members.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch members',
    });
  }
}

/**
 * 특정 회원 조회
 */
export async function getMemberById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('members').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Member not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch member',
    });
  }
}

/**
 * 회원 생성
 */
export async function createMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, phone, email, teamId, position, jerseyNumber, photoURL } = req.body;

    const memberData = {
      name,
      phone: phone || null,
      email: email || null,
      teamId: teamId || null,
      position: position || null,
      jerseyNumber: jerseyNumber || null,
      photoURL: photoURL || null,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await getDb().collection('members').add(memberData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...memberData,
      },
      message: 'Member created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create member',
    });
  }
}

/**
 * 회원 정보 수정
 */
export async function updateMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await getDb().collection('members').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Member not found',
      });
      return;
    }

    // 업데이트할 필드만 추출
    const allowedFields = ['name', 'phone', 'email', 'teamId', 'position', 'jerseyNumber', 'photoURL'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    updateData.updatedAt = FieldValue.serverTimestamp();

    await getDb().collection('members').doc(id).update(updateData);

    const updatedDoc = await getDb().collection('members').doc(id).get();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
      message: 'Member updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update member',
    });
  }
}

/**
 * 회원 삭제 (Soft Delete)
 */
export async function deleteMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('members').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Member not found',
      });
      return;
    }

    // Soft delete: isActive = false
    await getDb().collection('members').doc(id).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Member deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete member',
    });
  }
}

/**
 * 회원 완전 삭제 (Hard Delete) - Admin만
 */
export async function hardDeleteMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const doc = await getDb().collection('members').doc(id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Member not found',
      });
      return;
    }

    await getDb().collection('members').doc(id).delete();

    res.json({
      success: true,
      message: 'Member permanently deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete member',
    });
  }
}

/**
 * 엑셀 파일로 회원 일괄 등록
 * 엑셀 컬럼: 이름, 등번호, 포지션, 전화번호, 이메일
 */
export async function bulkUploadMembers(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    // 엑셀 파일 파싱
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Excel file is empty',
      });
      return;
    }

    // 컬럼 매핑 (한글/영문 모두 지원)
    const columnMap: { [key: string]: string } = {
      '이름': 'name',
      'name': 'name',
      '성명': 'name',
      '성 명': 'name',
      '등번호': 'jerseyNumber',
      'jerseyNumber': 'jerseyNumber',
      '번호': 'jerseyNumber',
      '배번': 'jerseyNumber',
      '포지션': 'position',
      'position': 'position',
      '전화번호': 'phone',
      'phone': 'phone',
      '연락처': 'phone',
      '연 락 처': 'phone',
      '이메일': 'email',
      'email': 'email',
    };

    const batch = getDb().batch();
    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      const rowNum = i + 2; // 엑셀 행 번호 (헤더 제외)

      // 컬럼 매핑 적용
      const mappedRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        const mappedKey = columnMap[key] || key;
        mappedRow[mappedKey] = value;
      }

      // 필수 필드 검증
      if (!mappedRow.name) {
        results.failed++;
        results.errors.push(`Row ${rowNum}: 이름이 없습니다`);
        continue;
      }

      // 포지션 유효성 검사
      const validPositions = ['GK', 'DF', 'MF', 'FW', null];
      let position = mappedRow.position?.toString().toUpperCase() || null;
      if (position && !validPositions.includes(position)) {
        // 한글 포지션 변환
        const positionMap: { [key: string]: string } = {
          '골키퍼': 'GK',
          '수비수': 'DF',
          '미드필더': 'MF',
          '공격수': 'FW',
        };
        position = positionMap[mappedRow.position] || null;
      }

      const memberData = {
        name: mappedRow.name.toString().trim(),
        jerseyNumber: mappedRow.jerseyNumber ? Number(mappedRow.jerseyNumber) : null,
        position: position,
        phone: mappedRow.phone?.toString().trim() || null,
        email: mappedRow.email?.toString().trim() || null,
        teamId: null,
        photoURL: null,
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = getDb().collection('members').doc();
      batch.set(docRef, memberData);
      results.success++;
    }

    if (results.success > 0) {
      await batch.commit();
    }

    res.status(201).json({
      success: true,
      data: {
        total: data.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors,
      },
      message: `${results.success}명의 회원이 등록되었습니다`,
    });
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: `${error.message || 'Failed to upload members'} - ${error.stack}`,
    });
  }
}

/**
 * 엑셀 템플릿 다운로드
 */
export async function downloadTemplate(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const templateData = [
      { '이름': '홍길동', '등번호': 10, '포지션': 'FW', '전화번호': '010-1234-5678', '이메일': 'hong@example.com' },
      { '이름': '김철수', '등번호': 7, '포지션': 'MF', '전화번호': '010-2345-6789', '이메일': '' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '회원목록');

    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 15 }, // 이름
      { wch: 10 }, // 등번호
      { wch: 10 }, // 포지션
      { wch: 15 }, // 전화번호
      { wch: 25 }, // 이메일
    ];

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=member_template.xlsx');
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate template',
    });
  }
}
