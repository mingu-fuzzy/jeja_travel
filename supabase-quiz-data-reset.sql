-- 새 설문 데이터 42개를 적용한 뒤 기존 테스트 답안만 초기화합니다.
-- 사진, 미션 진행도, 계정과 하트는 삭제하지 않습니다.
delete from public.quiz_results;

select count(*) as remaining_quiz_results
from public.quiz_results;
