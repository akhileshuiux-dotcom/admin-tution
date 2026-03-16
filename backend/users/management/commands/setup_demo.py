from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Create a superuser and a demo user'

    def handle(self, *args, **options):
        # Create Superuser
        if not User.objects.filter(email='admin@guardiantutoring.com').exists():
            User.objects.create_superuser('admin', 'admin@guardiantutoring.com', 'admin_password', name='Admin', role='Admin')
            self.stdout.write(self.style.SUCCESS('Successfully created superuser'))
        
        # Create Demo user
        if not User.objects.filter(email='demo@guardiantutoring.com').exists():
            user = User.objects.create_user('demo', 'demo@guardiantutoring.com', 'password', name='Sarah Jenkins', role='Admission Manager')
            self.stdout.write(self.style.SUCCESS('Successfully created demo user'))
