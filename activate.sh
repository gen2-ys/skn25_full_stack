#!/bin/bash

# 1. 가상환경 폴더 이름 설정
VENV_DIR=".venv"

# 2. 가상환경이 이미 존재하는지 확인
if [ -d "$VENV_DIR" ]; then
    echo "Virtual environment '$VENV_DIR' already exists."
else
    echo "Creating virtual environment at: $VENV_DIR"
    # 가상환경 생성 (python3 사용)
    python3 -m venv $VENV_DIR

    if [ $? -eq 0 ]; then
        echo "Successfully created."
    else
        echo "Error: Failed to create virtual environment."
        exit 1
    fi
fi

# 3. 안내 메시지 출력
echo "-------------------------------------------"
echo "Activate with: source $VENV_DIR/bin/activate"
echo "-------------------------------------------"

# 4. 현재 쉘에서 가상환경을 자동으로 활성화시키기 위한 로직
# (스크립트를 'source'로 실행했을 경우에만 작동함)
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    source "$VENV_DIR/bin/activate"
    echo "Environment activated!"
fi
