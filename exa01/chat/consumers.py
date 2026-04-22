import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.client_ip = self.scope['client'][0]

        self.room_name = "public_chat"
        self.room_group_name = f"chat_{self.room_name}"

        # 그룹에 참여
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # 그룹에서 탈퇴
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # 웹소켓으로부터 메세지 수신
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # 2. 그룹으로 메세지를 전송할 때 IP 주소도 함께 데이터로 넘깁니다.
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender_ip": self.client_ip  # 추출한 IP 추가
            }
        )

    # 그룹으로부터 메세지 수신
    async def chat_message(self, event):
        message = event["message"]
        sender_ip = event["sender_ip"]

        formatted_message = f"[{sender_ip}] {message}"

        await self.send(text_data=json.dumps({
            "message": formatted_message
        }))