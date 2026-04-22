from django.db import models
from django.core import validators

# Create your models here.
class skn25(models.Model):
    str_attr = models.CharField(max_length=32, 
                                default="기본값", db_column="name"
                                )
    int_attr = models.IntegerField(default=0, db_column="salary")
    bool_attr = models.BooleanField(default=False, db_column="Check")
    datetime_attr = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "playdata"


class Student(models.Model):
    name = models.CharField(max_length=128, help_text="학생 이름")
    phone = models.CharField(
        max_length=32, 
        validators=[validators.RegexValidator(regex=r"\d{3}-\d{3,4}-\d{4}")]
    )
    age = models.PositiveIntegerField(default=0)

    create_at = models.DateTimeField(auto_now_add=True, db_comment="생성시간")
    modified_at = models.DateTimeField(auto_now=True, db_comment="수정시간")

    def __str__(self):
        return self.name